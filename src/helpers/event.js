/**
 * Helper functions for event management in the DN Cascade app
 */

/**
 * Suggests a name for the event based on its ID
 * @param {string} input - The event ID
 * @returns {object|null} Object containing suggested name and tournament flag, or null if invalid input
 */
export const suggestName = (input) => {
  // split the id to get the first 2 characters and the rest, use fixed length for the first part
  if (input.length !== 5) return null;

  const [code, numerals] = [input.slice(0, 2).toUpperCase(), input.slice(2)];

  // if the code contains numbers or the numerals contain letters, return null
  if (!/^[A-Za-z]+$/.test(code) || !/^\d+$/.test(numerals)) return null;

  switch (code) {
    case "SZ":
      return {
        name: `${regionalTranscendence(numerals)}. západoslovenský regionálny turnaj`,
        tournament: true,
      };
    case "SS":
      return {
        name: `${regionalTranscendence(numerals)}. stredoslovenský regionálny turnaj`,
        tournament: true,
      };
    case "SV":
      return {
        name: `${regionalTranscendence(numerals)}. východoslovenský regionálny turnaj`,
        tournament: true,
      };
    case "SC":
      return {
        name: `Celoslovenský turnaj 20${numerals.slice(0, 2)}`,
        tournament: true,
      };
    case "SN":
      return {
        name: `${numerals.slice(2)}. začiatočnícky turnaj 20${numerals.slice(0, 2)}`,
        tournament: true,
      };
    case "RS":
      return {
        name: `${numerals.slice(2)}. rozhodcovský seminár 20${numerals.slice(0, 2)}`,
        tournament: false,
      };
    case "DS":
      return {
        name: `${numerals.slice(2)}. dobrovoľnícky seminár 20${numerals.slice(0, 2)}`,
        tournament: false,
      };
    case "TS":
      return {
        name: `${numerals.slice(2)}. trénerský seminár 20${numerals.slice(0, 2)}`,
        tournament: false,
      };
    case "US":
      return {
        name: `${numerals.slice(2)}. učiteľský seminár 20${numerals.slice(0, 2)}`,
        tournament: false,
      };
    case "VZ":
      return {
        name: `Valné zhromaždenie 20${numerals.slice(0, 2)}`,
        tournament: false,
      };
    case "TX":
      return {
        name: `Testovacie podujatie ${numerals}`,
        tournament: true,
      };
    default:
      return null;
  }
};

/**
 * Helper function to determine regional transcendence for event IDs
 * @param {string} numeral - The numeral part of the event ID
 * @returns {string} The transcended numeral
 */
const regionalTranscendence = (numeral) => {
  // get the last character of the numeral, if 1, return 2, if 2, return 3, if 3, return 1
  const lastChar = numeral.slice(-1);
  switch (lastChar) {
    case "1":
      return "2";
    case "2":
      return "3";
    case "3":
      return "1";
    default:
      return null;
  }
};

/**
 * Parses a date string as UTC date
 * @param {string} val - Date string in format YYYY-MM-DD
 * @returns {Date} UTC date object
 */
export const parseAsUTC = (val) => {
  // parse dateString as universal date
  return new Date(val + "T00:00:00Z");
};

/**
 * Gets the end time in minutes for a specific point in the schedule
 * @param {object} day - The day object from the schedule
 * @param {number} pointIndex - The index of the point
 * @returns {number} End time in minutes
 */
export const getEndTimeInMinutes = (day, pointIndex) => {
  let endTime = day.beginning;
  for (let i = 0; i <= pointIndex; i++) {
    endTime += day.points[i].duration;
  }
  return endTime;
};

/**
 * Creates a default event object with empty/default values
 * @returns {object} Default event object
 */
export const createDefaultEvent = () => {
  return {
    id: "",
    name: "",
    beginning: "",
    description: "",
    city: "",
    address: "",
    price: 30,
    motion: "Všetky tézy tohoto turnaja sú improvizované",
    deadline: "",
    link: "",
    draft: true,
    tournament: true,
    sponsors: [],
    organizers: [],
    schedule: {
      days: [
        {
          beginning: 810,
          offset: 0,
          points: [
            {
              name: "otvorenie podujatia",
              duration: 30,
            },
          ],
        },
      ],
    },
    presetThumbnail: null,
    presetOriginalThumbnail: null,
  };
};

/**
 * Checks if all required fields for an event are filled
 * @param {object} event - The event object
 * @param {Array} potentialOrganizers - Array of potential organizers
 * @returns {boolean} True if all required fields are filled
 */
export const canSubmitEvent = (event, potentialOrganizers) => {
  return (
    event.id &&
    event.name &&
    event.beginning &&
    event.city &&
    event.address &&
    event.price !== null &&
    event.deadline &&
    (event.tournament ? event.motion : true) &&
    event.schedule.days.length > 0 &&
    potentialOrganizers.some((organizer) => organizer.selected) &&
    event.link
  );
};

/**
 * Calculate ending date based on the beginning date and schedule
 * @param {string} beginningDate - Beginning date string in format YYYY-MM-DD
 * @param {object} schedule - Schedule object
 * @returns {Date} Ending date
 */
export const calculateEndingDate = (beginningDate, schedule) => {
  const date = new Date(beginningDate);
  // Get the sum of offsets of all days
  const sum = schedule.days.reduce((acc, day) => acc + day.offset, 0);
  const days = schedule.days.length + sum - 1;
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Prepares event data for submission
 * @param {object} event - The event object
 * @param {object} thumbnailRef - Reference to the thumbnail component
 * @param {Array} potentialOrganizers - Array of potential organizers
 * @returns {object} The prepared event data
 */
export const prepareEventData = async (
  event,
  thumbnailRef,
  potentialOrganizers,
) => {
  // If no original thumbnail is set, upload the thumbnail and get the path
  let thumbnail = event.presetOriginalThumbnail;
  if (event.presetOriginalThumbnail === null) {
    thumbnail = await thumbnailRef.value.uploadThumbnail();
  }

  // Calculate beginningDate based on the first day's beginning time
  const firstDay = event.schedule.days[0];
  const beginningUTC = parseAsUTC(event.beginning);
  const beginningDate = new Date(
    beginningUTC.getTime() + firstDay.beginning * 60000,
  );

  // Calculate endDate based on the last day's last point end time
  const endDate = calculateEndingDate(event.beginning, event.schedule);
  // Add minutes to the last day's last point end time
  const lastDay = event.schedule.days[event.schedule.days.length - 1];
  const minutesOfLastDay = getEndTimeInMinutes(
    lastDay,
    lastDay.points.length - 1,
  );

  endDate.setMinutes(endDate.getMinutes() + minutesOfLastDay);

  // organizers is only array of strings => uid of the selected organizers
  const organizers = potentialOrganizers
    .filter((organizer) => organizer.selected)
    .map((organizer) => organizer.uid);

  // { uid: uid, name: name, surname: surname, email: email, phone: phone }
  const contacts = potentialOrganizers
    .filter((organizer) => organizer.selected)
    .map((organizer) => ({
      uid: organizer.uid || "",
      name: organizer.name || "",
      surname: organizer.surname || "",
      email: organizer.email || "",
      phone: organizer.phone || "",
    }));

  // Create the event
  return {
    id: event.id.toLowerCase(),
    name: event.name,
    beginningDate: beginningDate,
    endDate: endDate,
    description: event.description,
    city: event.city,
    address: event.address,
    price: event.price,
    motion: event.motion,
    deadline: new Date(event.deadline),
    schedule: event.schedule,
    thumbnail: thumbnail,
    organizers: organizers,
    contacts: contacts,
    link: event.link,
    draft: event.draft,
    sponsors: event.sponsors,
  };
};
