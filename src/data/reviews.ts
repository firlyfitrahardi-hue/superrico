/**
 * Google reviews for Super Rico, captured from the Google Maps listing on 2 October 2026.
 * Summary numbers come from the listing's rating breakdown. Texts are quoted as written.
 */
export const reviewSummary = {
  rating: 4.7,
  total: 231,
  breakdown: [
    { stars: 5, count: 195 },
    { stars: 4, count: 18 },
    { stars: 3, count: 13 },
    { stars: 2, count: 1 },
    { stars: 1, count: 4 },
  ],
  mentioned: [
    { label: 'birria', count: 19 },
    { label: 'pulled beef', count: 18 },
    { label: 'wings', count: 12 },
    { label: 'beef tongue taco', count: 9 },
    { label: 'pulled beef bowl', count: 9 },
    { label: 'birria taco', count: 6 },
    { label: 'quattro quesadilla', count: 5 },
  ],
  capturedOn: '2 October 2026',
}

export interface Review {
  author: string
  badge?: string
  stars: number
  when: string
  text: string
  highlight?: string
}

export const reviews: Review[] = [
  {
    author: 'Martha Theodora',
    badge: 'Local Guide',
    stars: 5,
    when: '3 months ago',
    highlight: 'A regular, at least once a month',
    text:
      'I’m a regular here, and usually visit at least once a month. The food is consistently delicious and perfectly suited to my taste — zesty, tangy, and refreshing. The service is also attentive, friendly, and quick. It’s great to finally have a proper Mexican restaurant around.',
  },
  {
    author: 'lisa kiryuu',
    badge: 'Local Guide',
    stars: 5,
    when: '3 months ago',
    highlight: '10/10, wanna go back again',
    text:
      '10/10 wanna back again. Delicious Mexican food. I love the shrimp tacos, I choose the hard shell. Tortilla shell was crispy but not hard to chew, shrimp was al dente and flavourful. Mexican bowl also delicious, grill chicken is recommended, full of spice. Ice tea is free refill.',
  },
  {
    author: 'honesteater',
    badge: 'Local Guide',
    stars: 5,
    when: '2 months ago',
    highlight: 'Finally satisfied the craving',
    text:
      'My husband and I had been craving Mexican food for a while, and we finally found a spot in Serpong that actually satisfied the craving. We loved the tacos. The burrito was delicious too. You can choose either rice or french fries as the filling, and we went with the fries. Overall, the food, the interior, and the ambience were all great.',
  },
  {
    author: 'aike tirtayadi',
    badge: 'Local Guide',
    stars: 5,
    when: '6 months ago',
    highlight: 'Must try the birria',
    text:
      'Had birria taco fish, burrito chicken and pulled beef bowl. All was good! But must try the homemade fries with the dips, and the birria. Prepare yourself to wait a little while because it is quite packed on lunch time.',
  },
  {
    author: 'ran',
    stars: 5,
    when: '6 months ago',
    highlight: 'The chicken wing was extremely tasty',
    text:
      'The chicken wing was extremely tasty! The taco was really really good too, it was fresh and rich with flavor. I also ordered a super soda lime and it was SOOOO good. It will definitely freshen you up, especially during hot weather. Very affordable too.',
  },
  {
    author: 'Owen L Taslim',
    stars: 5,
    when: '6 months ago',
    highlight: 'You get your money’s worth',
    text:
      'The food was absolutely delicious! I was really impressed with the portion sizes — you definitely get your money’s worth. High quality at a price that actually makes sense. Highly recommended!',
  },
  {
    author: 'Yohanes Jusuf',
    badge: 'Local Guide',
    stars: 5,
    when: '6 months ago',
    highlight: 'No pork, no lard, free parking',
    text:
      'No pork no lard, 2 floors, free parking. Mexican food. Burrito is preferable. Expect a wait for the food preparation. Next will come for the taco platter.',
  },
  {
    author: 'Haryanti Ari',
    badge: 'Local Guide',
    stars: 4,
    when: '3 months ago',
    highlight: 'Recommended: taco platter',
    text:
      'Recommended taco platter, you can try them all. The staff explains the dishes well and clearly, from the taste and texture of the food. There are also a variety of sauce options. The place is clean, cute, and unique.',
  },
  {
    author: 'EarthWalker',
    badge: 'Local Guide',
    stars: 5,
    when: '5 months ago',
    highlight: 'Adjusted for the local tongue, still authentic',
    text:
      'Tried this gem based on our friend’s recommendation. Quite delicious. Taste is adjusted for the Indonesian tongue, but still quite authentic. Love the quesadilla and the taco, hard and crispy.',
  },
  {
    author: 'kezya agatha',
    badge: 'Local Guide',
    stars: 4,
    when: '5 months ago',
    highlight: 'Def come here if you crave Mexican',
    text:
      'Delicious!! If you guys are craving some Mexican food, def come here! We ordered fish taco, beef quesadilla, and pulled beef burrito. They were all very nice! Ambiance was cute and service was nice. A solid high 4 stars for me.',
  },
]
