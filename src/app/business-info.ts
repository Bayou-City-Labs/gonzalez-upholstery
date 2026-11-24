// TODO: confirm NAP (address/phone/hours) with the client before launch.
// Sourced from carhq.org and Yahoo Local (2026-11-24); Yelp's own listing returned 403 on fetch.
export const BUSINESS = {
  name: "Gonzalez Auto Upholstery",
  tagline: "Family-owned auto upholstery in Houston since 2007.",
  phone: "(832) 723-3036",
  phoneHref: "tel:+18327233036",
  address: {
    street: "10730 Jones Rd",
    city: "Houston",
    state: "TX",
    zip: "77065",
  },
  hours: [
    { days: "Monday – Friday", time: "8:00 AM – 6:00 PM" },
    { days: "Saturday", time: "8:00 AM – 1:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  services: [
    {
      name: "Convertible Tops",
      description: "Replacement and repair, including hydraulic system work for power tops.",
    },
    {
      name: "Headliners",
      description: "Clean, imperfection-free headliner replacement and repair.",
    },
    {
      name: "Seat Upholstery",
      description: "Seat repair and full reupholstery in the material of your choice.",
    },
    {
      name: "Door Panels",
      description: "Door panel upholstery repair and replacement to match your interior.",
    },
    {
      name: "Carpet",
      description: "Carpet replacement and repair for worn or damaged interiors.",
    },
    {
      name: "Dashboards",
      description: "Dashboard repair and restoration, from cracks to full re-covering.",
    },
    {
      name: "Custom Interiors",
      description: "Fully custom auto interiors built to your specification.",
    },
  ],
} as const;
