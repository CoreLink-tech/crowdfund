export type Campaign = {
  slug: string;
  title: string;
  organizer: string;
  location: string;
  category: string;
  raised: number;
  goal: number;
  donors: number;
  daysLeft: number;
  image: string;
  featured?: boolean;
  verified?: boolean;
  story: string[];
};

export const campaigns: Campaign[] = [
  {
    slug: "help-amara-access-heart-surgery",
    title: "Help Amara get the heart surgery she needs",
    organizer: "Chika Okafor",
    location: "Enugu, Nigeria",
    category: "Medical",
    raised: 3850000,
    goal: 6000000,
    donors: 248,
    daysLeft: 18,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=85",
    featured: true,
    verified: true,
    story: [
      "Amara is a bright, joyful 9-year-old who has spent much of the last year in and out of hospital. Her doctors have recommended a heart procedure that her family cannot afford on their own.",
      "Her family is raising funds to cover the procedure, hospital care and recovery. Every contribution, no matter the size, will help them get closer to the treatment she needs.",
      "We will continue sharing updates as the family moves through the treatment process. Thank you for standing with Amara."
    ]
  },
  {
    slug: "keep-30-students-in-school",
    title: "Keep 30 children in school this academic year",
    organizer: "Bright Futures Initiative",
    location: "Benin City, Nigeria",
    category: "Education",
    raised: 1240000,
    goal: 2500000,
    donors: 96,
    daysLeft: 26,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=85",
    verified: true,
    story: [
      "Thirty children in our community are at risk of missing another school year because their families are struggling with school fees and basic learning materials.",
      "This fundraiser will support tuition, uniforms, books and essential supplies for the students.",
      "We will publish spending updates and progress reports so supporters can follow the impact of their contributions."
    ]
  },
  {
    slug: "rebuild-after-market-fire",
    title: "Help 12 market traders rebuild after a devastating fire",
    organizer: "Efe Omoregie",
    location: "Warri, Nigeria",
    category: "Emergency",
    raised: 2780000,
    goal: 4500000,
    donors: 173,
    daysLeft: 11,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85",
    story: [
      "A fire destroyed several small shops in our local market, leaving twelve traders without their stock, equipment or daily source of income.",
      "The funds raised will help replace essential equipment and initial stock so these families can begin trading again.",
      "We are working with the affected traders and will share receipts and progress updates as support is distributed."
    ]
  },
  {
    slug: "community-clean-water-project",
    title: "Bring clean water to a rural community",
    organizer: "Water for All Network",
    location: "Delta State, Nigeria",
    category: "Community",
    raised: 920000,
    goal: 1800000,
    donors: 71,
    daysLeft: 34,
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1200&q=85",
    verified: true,
    story: [
      "Families in this community travel long distances to access water, and the available sources are often unreliable.",
      "We are raising funds to repair a borehole, install a water storage tank and improve access points.",
      "Community representatives will provide updates as work progresses."
    ]
  },
  {
    slug: "support-young-creative-founders",
    title: "Give young creatives the tools to build their future",
    organizer: "The Makers Project",
    location: "Lagos, Nigeria",
    category: "Community",
    raised: 680000,
    goal: 1500000,
    donors: 54,
    daysLeft: 21,
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=85",
    story: [
      "We are creating a small shared studio where young people can learn practical creative skills and work on real projects.",
      "Contributions will go towards tools, training materials and the first three months of running the space.",
      "Our aim is to make useful skills and equipment more accessible to young people who otherwise cannot afford them."
    ]
  },
  {
    slug: "help-family-recover-from-flooding",
    title: "Help a family recover after severe flooding",
    organizer: "Tomi Adebayo",
    location: "Kogi State, Nigeria",
    category: "Emergency",
    raised: 1560000,
    goal: 3000000,
    donors: 112,
    daysLeft: 8,
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&q=85",
    story: [
      "Severe flooding damaged this family's home and destroyed many of their essential belongings.",
      "The family is seeking help with temporary accommodation, basic household items and repairs.",
      "Every contribution will help them take the next step towards rebuilding."
    ]
  }
];

export const categories = ["All campaigns", "Medical", "Education", "Emergency", "Community", "Memorial", "Animals", "Business"];

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(amount);
}

export function progressPercent(raised: number, goal: number) {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}
