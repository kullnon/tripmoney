// lib/authors.js — Single-author bio map for MyTripMoney blog
export const AUTHORS = {
  'marcus-chen': {
    name: 'Marcus Chen',
    role: 'Travel Finance Editor',
    bio: "Marcus has tracked his spending across 47 countries and 3 currencies he didn't know existed. He writes about travel budgeting at MyTripMoney.",
    image: '/authors/marcus-chen.jpg',
  },
};

export function getAuthor(slug) {
  return AUTHORS[slug] || AUTHORS['marcus-chen'];
}
