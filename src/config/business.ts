export const business = {
  officialName: "Центр вивчення іноземних мов SOVA",
  brandName: "SOVA",
  city: "Мукачево",
  address: "площа Кирила і Мефодія, 26/11, Мукачево",
  phoneE164: "+380992671906",
  phoneDisplay: "+380 99 267 1906",
  foundedYear: 2019,
  currentStudents: "100+",
  lifetimeStudents: "1000+",
  schedule: {
    mondayToSaturday: "09:00–20:00",
    sunday: null,
  },
  instagram: "https://www.instagram.com/sova.mukachevo/",
  facebook: "https://www.facebook.com/sova.mukachevo/",
  googleMaps:
    "https://www.google.com/maps/place/%D0%A1%D0%BE%D0%B2%D0%B0/data=!4m2!3m1!1s0x0:0x339a2e961f51ca4e?sa=X&ved=1t:2428&ictx=111",
  lessonMinutes: { min: 60, max: 75 },
  frequencyPerWeek: { min: 2, max: 3 },
  trialMinutes: 45,
} as const;

export const businessAddress = {
  uk: business.address,
  en: "26/11 Kyryla i Mefodiia Square, Mukachevo",
} as const;
