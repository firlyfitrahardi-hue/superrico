import type { FaqItem, MenuCategory } from '../types'
import { asset } from './asset'

/**
 * Menu based on the Google Maps menu tab, the printed menu board photo and recent reviews
 * (captured 2 October 2026). Prices change, so they are left to GoFood / GrabFood.
 */
export const menu: MenuCategory[] = [
  {
    id: 'tacos',
    title: 'Tacos',
    blurb: 'Hard shell or soft, from the birria everyone talks about to the new Tex-Mex pepperoni taco.',
    image: asset('/images/editorial/tacos.webp'),
    items: [
      { name: 'Birria Taco', description: 'Slow-braised beef birria with melted cheese, cilantro and onion. Served with consommé for dipping.', tags: ['Most Mentioned'] },
      { name: 'Pulled Beef Taco', description: 'Tender pulled beef, pico de gallo, cheese and house crema in a crispy hard shell.' },
      { name: 'Shrimp Tacos, Hard Shell', description: 'Golden shrimp, shredded cheese, lettuce and lime. Crispy shell that stays crunchy.', tags: ['Popular'] },
      { name: 'Fish Taco', description: 'Crispy fish, cabbage slaw and chipotle mayo.' },
      { name: 'Beef Tongue Taco', description: 'Rich, tender beef tongue with salsa verde and onion. A regulars’ favourite.' },
      { name: 'Pepperoni Taco', description: 'Birria taco topped with pepperoni, mozzarella, cilantro and onion.', tags: ['New · Tex-Mex'] },
      { name: 'Super Taco Platter', description: 'Assorted tacos so you can try them all. Ask the team to walk you through each one.', tags: ['To Share'] },
    ],
  },
  {
    id: 'burritos',
    title: 'Burritos',
    blurb: 'Rolled tight with cheese and salsa. Choose rice or fries inside.',
    image: asset('/images/editorial/burrito.webp'),
    items: [
      { name: 'Pulled Beef Burrito', description: 'Pulled beef, cheese, salsa and your choice of rice or crispy fries inside.', tags: ['Popular'] },
      { name: 'Chicken Burrito', description: 'Grilled chicken, beans, cheese and crema. Served with tortilla chips.' },
      { name: 'Shredded Beef', description: 'Shredded beef wrapped with rice, beans and house salsa.' },
    ],
  },
  {
    id: 'bowls',
    title: 'Bowls',
    blurb: 'Everything in the burrito, minus the tortilla. Rice, corn, beans, salsa and crema.',
    image: asset('/images/editorial/bowl.webp'),
    items: [
      { name: 'Pulled Beef Bowl', description: 'Pulled beef over rice with corn, black beans, lettuce, pico and crema.', tags: ['Popular'] },
      { name: 'Grill Chicken Bowl', description: 'Spiced grilled chicken with black beans, corn and rice. The lighter choice, a little spicy.' },
      { name: 'Ground Beef Bowl', description: 'Seasoned ground beef, cheese, lettuce and salsa over rice.' },
    ],
  },
  {
    id: 'quesadilla',
    title: 'Quesadilla',
    blurb: 'Griddled tortillas, lots of cheese, sour cream on the side.',
    image: asset('/images/editorial/quesadilla.webp'),
    items: [
      { name: 'Cheese Quesadilla with Sour Cream', description: 'Simple and melty. The one reviewers keep recommending.', tags: ['Popular'] },
      { name: 'Beef Quesadilla', description: 'Loaded with seasoned ground beef and cheese.' },
      { name: 'Quattro Quesadilla', description: 'Four-cheese quesadilla for serious cheese people.' },
    ],
  },
  {
    id: 'sharing',
    title: 'Sharing & Sides',
    blurb: 'For the table. Start with chips and guac, finish with wings.',
    image: asset('/images/editorial/sharing.webp'),
    items: [
      { name: 'Tortilla Chips with Guacamole & Salsa', description: 'Warm chips with house guacamole and salsa. Add extra guac, you will want it.', tags: ['Popular'] },
      { name: 'Rico Wings', description: 'Sticky, spiced chicken wings with lime and salsa.', tags: ['Popular'] },
      { name: 'Loaded Nachos', description: 'Chips, beef, cheese sauce, jalapeño, sour cream and pico de gallo.' },
      { name: 'Homemade Fries with Dips', description: 'Crispy fries with guacamole, salsa and crema.' },
    ],
  },
  {
    id: 'drinks',
    title: 'Drinks & Combos',
    blurb: 'Super Combo sets with fries or nachos and a drink. Daily specials through the week.',
    image: asset('/images/editorial/drinks.webp'),
    items: [
      { name: 'Super Soda', description: 'House-made sodas. The lime is the one everyone orders in hot weather.', tags: ['Signature'] },
      { name: 'Iced Tea', description: 'Free refill when you dine in.' },
      { name: 'Lemonade', description: 'Fresh lemonade with ice.' },
      { name: 'Super Combo', description: 'A main with fries or nachos plus a drink. Ask about today’s special.', tags: ['Value'] },
    ],
  },
]

export const faqs: FaqItem[] = [
  {
    question: 'Where is Super Rico?',
    answer:
      'Ruko Aniva Grande Blok GE No. 5, Gading Serpong, Tangerang. Tap "Find Us" for directions. Parking in front of the shop is free.',
  },
  {
    question: 'What are your opening hours?',
    answer: 'Open daily from 10.00 to 21.00. Lunch gets busy, so come early or reserve a table.',
  },
  {
    question: 'Do you serve pork?',
    answer: 'No. Super Rico is no pork, no lard. Beef, chicken, shrimp and fish only.',
  },
  {
    question: 'Do you take reservations?',
    answer:
      'Yes. Use the reservation form on this page and we will confirm your table. We have two floors, so groups are welcome. For more than 20 guests, DM us on Instagram so we can plan the space.',
  },
  {
    question: 'How much should I budget?',
    answer: 'Most guests spend around Rp 50–100K per person. Super Combo sets are the best value.',
  },
  {
    question: 'Can I order delivery?',
    answer: 'Yes. Super Rico is on GoFood and GrabFood. Search "Super Rico" in either app.',
  },
  {
    question: 'Do you host events or cater?',
    answer:
      'We do. Birthdays, gatherings and office lunches are welcome, and you will find us at food festivals around Serpong. DM @superrico.id with your date and headcount.',
  },
  {
    question: 'Is the food spicy?',
    answer:
      'Mild by default and tuned for local taste. Ask for the habanero chili or extra salsa if you like heat.',
  },
]
