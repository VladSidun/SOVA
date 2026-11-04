export const privacy = {
  uk: {
    title: "Політика конфіденційності",
    intro: "Центр вивчення іноземних мов SOVA використовує дані заявки, щоб зв’язатися з вами щодо навчання та узгодити пробний урок.",
    back: "На головну",
    sections: [
      { title: "Які дані ви надаєте", body: "У формі ви вказуєте ім’я, телефон, бажаний спосіб зв’язку, цілі та формат навчання. Вік або клас і коментар необов’язкові. Не додавайте до коментаря чутливі особисті дані." },
      { title: "Для чого потрібні дані", body: "Ми використовуємо ці відомості лише для відповіді на ваш запит щодо навчання, підбору програми та узгодження пробного уроку. Згода під формою стосується цього зв’язку; вона не є згодою на рекламне відстеження." },
      { title: "Як передається заявка", body: "Заявка передається через сервер сайту до приватної Telegram-групи або каналу адміністрації SOVA. Cloudflare Turnstile перевіряє запит для захисту від автоматичних заявок. Якщо надсилання не вдалося, сайт пропонує прямі контакти; ваші введені дані залишаються у відкритій формі." },
      { title: "Джерело переходу", body: "Сайт зберігає джерело переходу та UTM-позначки у sessionStorage на час сесії. Разом із заявкою адміністрація отримує ці позначки, адресу сторінки та джерело переходу, щоб розуміти, звідки надійшов запит. Не додавайте персональні дані до адреси сторінки." },
      { title: "Аналітика", body: "Події взаємодії можуть містити лише обмежені категорії, наприклад мову сайту, обрану ціль або номер кроку. Ім’я, телефон, коментар, вік, адреси сторінок та UTM-позначки не передаються через наш analytics helper. Зовнішні аналітичні скрипти зараз не завантажуються. Їх підключення потребуватиме окремого вибору щодо відстеження та оновлення цієї політики." },
      { title: "Запит щодо ваших даних", body: "Для уточнення, виправлення або видалення даних вашої заявки зверніться до SOVA за телефоном нижче. Деталі строків зберігання та використання сторонніх сервісів мають бути уточнені школою перед публічним запуском." },
    ],
    contact: "Контакт SOVA",
    policyLink: "Політика конфіденційності",
  },
  en: {
    title: "Privacy policy",
    intro: "SOVA Foreign Language Learning Centre uses your enquiry details to contact you about learning and arrange a trial lesson.",
    back: "Back to home",
    sections: [
      { title: "Details you provide", body: "The form asks for your name, phone number, preferred contact method, learning goals and study mode. Age or school year and a comment are optional. Please leave sensitive personal information out of the comment." },
      { title: "Why we use your details", body: "We use these details only to respond to your learning enquiry, recommend a programme and arrange a trial lesson. The form checkbox covers this contact; it does not grant consent to advertising tracking." },
      { title: "How an enquiry is delivered", body: "The website server sends your enquiry to a private Telegram group or channel for SOVA administration. Cloudflare Turnstile checks requests to protect against automated submissions. If sending fails, the site offers direct contact links and keeps your entries in the open form." },
      { title: "Visit attribution", body: "The site keeps referral and UTM campaign details in sessionStorage for the session. These details, the page address and referral source accompany your enquiry so administration can understand where it came from. Please do not put personal details in page addresses." },
      { title: "Analytics", body: "Interaction events can contain only limited categories, such as site language, selected goal or form step. Our analytics helper does not send names, phone numbers, comments, ages, page addresses or campaign parameters. External analytics scripts are currently not loaded. Connecting them will require a separate tracking choice and an update to this policy." },
      { title: "Requests about your data", body: "To ask about, correct or delete your enquiry details, contact SOVA using the phone number below. The school must clarify retention periods and third-party service details before public launch." },
    ],
    contact: "Contact SOVA",
    policyLink: "Privacy policy",
  },
} as const;
