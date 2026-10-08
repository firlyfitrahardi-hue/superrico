import { useEffect, useRef, useState } from 'react'

interface AlphaVideoProps {
  /** "Stacked alpha" MP4: colour in the top half, alpha matte in the bottom half (see scripts/key-video.mjs) */
  src: string
  /** Transparent still shown until the first frame is ready, and whenever the video is not playing */
  poster: string
  alt: string
  /** Play only while true (on screen, and the user has not asked for reduced motion) */
  play: boolean
  /** Seconds of fade at each end of the loop, so a non-seamless clip never visibly jumps */
  loopFade?: number
  /** Pin the picture to the bottom of its box instead of centring it */
  anchorBottom?: boolean
  /** "auto" fetches the clip immediately; "metadata" waits until it is asked to play (worlds below the first) */
  preload?: 'auto' | 'metadata'
  className?: string
}

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // y = 0 at the top of the video
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTexel; // one texel in v, to keep the two halves from bleeding into each other
uniform float uFade;
void main() {
  vec3 color = texture2D(uTex, vec2(vUv.x, clamp(vUv.y * 0.5, 0.0, 0.5 - uTexel))).rgb;
  float alpha = texture2D(uTex, vec2(vUv.x, clamp(0.5 + vUv.y * 0.5, 0.5 + uTexel, 1.0))).r;
  // colour is already premultiplied; clamp so compression noise cannot exceed the matte
  gl_FragColor = vec4(min(color, vec3(alpha)), alpha) * uFade;
}`

/**
 * Plays a video with real transparency in every browser. Browsers disagree on alpha video
 * formats, so the clip is ordinary H.264 with the matte stored underneath the picture, and
 * a few lines of WebGL put the two back together on a canvas.
 */
export default function AlphaVideo({ src, poster, alt, play, loopFade = 0.3, anchorBottom = false, preload = 'auto', className = '' }: AlphaVideoProps) {
  const fit = anchorBottom ? 'object-contain object-bottom' : 'object-contain'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const drawRef = useRef<(() => void) | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  // WebGL setup, once
  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) {
      setFailed(true)
      return
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true)
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const uTexel = gl.getUniformLocation(program, 'uTexel')
    const uFade = gl.getUniformLocation(program, 'uFade')
    let sized = false
    let lastTime = 0
    let hasLooped = false

    const draw = () => {
      if (video.readyState < 2 || !video.videoWidth) return
      if (!sized) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight / 2
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform1f(uTexel, 1 / video.videoHeight)
        sized = true
      }
      const t = video.currentTime
      const d = video.duration || 0
      if (t < lastTime - 0.5) hasLooped = true
      lastTime = t
      // Fade out at the end of every pass. Fade in only after a loop: the very first pass
      // takes over from the poster, which already shows the first frame.
      const fadeIn = hasLooped ? t / loopFade : 1
      const fade = loopFade > 0 && d > 0 ? Math.max(0, Math.min(1, fadeIn, (d - t) / loopFade)) : 1
      gl.uniform1f(uFade, fade)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      setReady(true)
    }
    drawRef.current = draw

    return () => {
      drawRef.current = null
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [loopFade])

  // Track whether the clip is really advancing. The canvas is only shown while it is, so a
  // refused or suspended autoplay leaves the poster on screen rather than an empty box.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onPlaying = () => setPlaying(true)
    const onStopped = () => setPlaying(false)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('pause', onStopped)
    video.addEventListener('waiting', onStopped)
    return () => {
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('pause', onStopped)
      video.removeEventListener('waiting', onStopped)
    }
  }, [])

  // Play / pause, and draw only when the video produces a new frame
  useEffect(() => {
    const video = videoRef.current
    if (!video || failed) return
    if (!play) {
      video.pause()
      return
    }

    let handle = 0
    let cancelled = false
    type FrameVideo = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number
      cancelVideoFrameCallback?: (id: number) => void
    }
    const v = video as FrameVideo
    const useVideoFrames = typeof v.requestVideoFrameCallback === 'function'

    const loop = () => {
      if (cancelled) return
      drawRef.current?.()
      handle = useVideoFrames ? v.requestVideoFrameCallback!(loop) : requestAnimationFrame(loop)
    }
    loop()

    // Autoplay rules look at the muted state, and React does not reliably write the attribute
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')

    const tryPlay = () => {
      if (cancelled || !video.paused || document.visibilityState !== 'visible') return
      video.play().catch(() => {
        /* refused for now: the poster stays, and the listeners below try again */
      })
    }
    tryPlay()

    // Browsers suspend silent video in hidden tabs and do not always resume it, and a start
    // request made before the data arrives can be dropped. Retry on each of these moments.
    video.addEventListener('canplay', tryPlay)
    document.addEventListener('visibilitychange', tryPlay)
    window.addEventListener('pointerdown', tryPlay, { passive: true })
    window.addEventListener('scroll', tryPlay, { passive: true })
    window.addEventListener('focus', tryPlay)
    window.addEventListener('pageshow', tryPlay)

    return () => {
      cancelled = true
      video.removeEventListener('canplay', tryPlay)
      document.removeEventListener('visibilitychange', tryPlay)
      window.removeEventListener('pointerdown', tryPlay)
      window.removeEventListener('scroll', tryPlay)
      window.removeEventListener('focus', tryPlay)
      window.removeEventListener('pageshow', tryPlay)
      if (useVideoFrames) v.cancelVideoFrameCallback?.(handle)
      else cancelAnimationFrame(handle)
    }
  }, [play, failed])

  const showCanvas = ready && play && playing && !failed

  return (
    <div className={`relative ${className}`}>
      <img
        src={poster}
        alt={alt}
        draggable={false}
        decoding="async"
        className={`h-full w-full ${fit} transition-opacity duration-300`}
        style={{ opacity: showCanvas ? 0 : 1 }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${fit} transition-opacity duration-300`}
        style={{ opacity: showCanvas ? 1 : 0 }}
      />
      {/* Decoder only: never shown. Muted + playsInline so phones allow autoplay. */}
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload={preload}
        onError={() => setFailed(true)}
        className="pointer-events-none absolute h-px w-px opacity-0"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}
