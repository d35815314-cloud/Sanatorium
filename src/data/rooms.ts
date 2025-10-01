import { Room } from "@/types/booking";

// Room type mappings based on room numbers
const roomTypeMapping: Record<string, Room["type"]> = {
  // 2х Местный (double)
  "1101": "double",
  "1105": "double",
  "1107": "double",
  "1125": "double",
  "1127": "double",
  "1213": "double",
  "1215": "double",
  "1217": "double",
  "1219": "double",
  "1221": "double",
  "1223": "double",
  "1225": "double",
  "1227": "double",
  "1237": "double",
  "1239": "double",
  "1204": "double",
  "1216": "double",
  "1220": "double",
  "1305": "double",
  "1307": "double",
  "1309": "double",
  "1313": "double",
  "1317": "double",
  "1319": "double",
  "1327": "double",
  "1339": "double",
  "1401": "double",
  "1403": "double",
  "1405": "double",
  "1407": "double",
  "1409": "double",
  "1411": "double",
  "1413": "double",
  "1417": "double",
  "1419": "double",
  "1421": "double",
  "1423": "double",
  "1425": "double",
  "1439": "double",
  "1501": "double",
  "1503": "double",
  "1505": "double",
  "1507": "double",
  "1509": "double",
  "1511": "double",
  "1513": "double",
  "1515": "double",
  "1517": "double",
  "1519": "double",
  "1521": "double",
  "1523": "double",
  "1525": "double",
  "1527": "double",
  "1529": "double",
  "1531": "double",
  "1537": "double",
  "1539": "double",
  "1506": "double",
  "1510": "double",
  "2101": "double",
  "2105": "double",
  "2106": "double",
  "2107": "double",
  "2117": "double",
  "2119": "double",
  "2125": "double",
  "2127": "double",
  "2209": "double",
  "2211": "double",
  "2213": "double",
  "2215": "double",
  "2217": "double",
  "2219": "double",
  "2221": "double",
  "2223": "double",
  "2225": "double",
  "2227": "double",
  "2229": "double",
  "2231": "double",
  "2233": "double",
  "2235": "double",
  "2237": "double",
  "2239": "double",
  "2301": "double",
  "2303": "double",
  "2307": "double",
  "2309": "double",
  "2315": "double",
  "2317": "double",
  "2319": "double",
  "2323": "double",
  "2325": "double",
  "2327": "double",
  "2401": "double",
  "2403": "double",
  "2405": "double",
  "2407": "double",
  "2409": "double",
  "2411": "double",
  "2413": "double",
  "2415": "double",
  "2417": "double",
  "2419": "double",
  "2421": "double",
  "2423": "double",
  "2425": "double",
  "2427": "double",
  "2429": "double",
  "2431": "double",
  "2433": "double",
  "2435": "double",
  "2437": "double",
  "2439": "double",
  "2501": "double",
  "2503": "double",
  "2505": "double",
  "2507": "double",
  "2509": "double",
  "2511": "double",
  "2513": "double",
  "2515": "double",
  "2517": "double",
  "2519": "double",
  "2521": "double",
  "2523": "double",
  "2525": "double",
  "2527": "double",
  "2531": "double",
  "2533": "double",
  "2537": "double",
  "2539": "double",

  // 2х Местный ул. 1 кат. (душ) (double_improved)
  "1117": "double_improved",
  "1119": "double_improved",
  "1121": "double_improved",
  "1123": "double_improved",
  "2109": "double_improved",
  "2111": "double_improved",
  "2113": "double_improved",
  "2115": "double_improved",
  "2121": "double_improved",
  "2123": "double_improved",
  "2329": "double_improved",
  "2331": "double_improved",
  "2333": "double_improved",
  "2335": "double_improved",
  "2337": "double_improved",
  "2339": "double_improved",
  "2320": "double_improved",
  "2324": "double_improved",

  // 1 Местный стд. (single)
  "1206": "single",
  "1214": "single",
  "1218": "single",
  "1304": "single",
  "1308": "single",
  "1316": "single",
  "1320": "single",
  "1404": "single",
  "1408": "single",
  "1412": "single",
  "1416": "single",
  "1420": "single",
  "1504": "single",
  "1508": "single",
  "1512": "single",
  "1516": "single",
  "1520": "single",
  "2110": "single",
  "2114": "single",
  "2122": "single",
  "2118": "single",
  "2108": "single",
  "2202": "single",
  "2204": "single",
  "2208": "single",
  "2210": "single",
  "2302": "single",
  "2304": "single",
  "2308": "single",
  "2310": "single",
  "2314": "single",
  "2402": "single",
  "2408": "single",
  "2410": "single",
  "2414": "single",
  "2418": "single",
  "2422": "single",
  "2504": "single",
  "2508": "single",
  "2510": "single",
  "2514": "single",
  "2518": "single",
  "2522": "single",

  // Семейный (family)
  "1212": "family",
  "1306": "family",
  "1310": "family",
  "1314": "family",
  "1318": "family",
  "1322": "family",
  "1311": "family",
  "1315": "family",
  "1321": "family",
  "1323": "family",
  "1337": "family",
  "1415": "family",
  "1427": "family",
  "1437": "family",
  "1406": "family",
  "1410": "family",
  "1414": "family",
  "1418": "family",
  "1422": "family",
  "1533": "family",
  "1535": "family",
  "1514": "family",
  "1518": "family",
  "1522": "family",
  "2116": "family",
  "2120": "family",
  "2124": "family",
  "2206": "family",
  "2212": "family",
  "2216": "family",
  "2305": "family",
  "2311": "family",
  "2313": "family",
  "2321": "family",
  "2306": "family",
  "2312": "family",
  "2316": "family",
  "2404": "family",
  "2406": "family",
  "2412": "family",
  "2416": "family",
  "2420": "family",
  "2424": "family",
  "2535": "family",
  "2502": "family",
  "2506": "family",
  "2512": "family",
  "2516": "family",
  "2520": "family",
  "2524": "family",

  // Люкс 2 Местный (luxury_double)
  "1229": "luxury_double",
  "1233": "luxury_double",
  "1302": "luxury_double",
  "1329": "luxury_double",
  "1333": "luxury_double",
  "1429": "luxury_double",
  "1433": "luxury_double",
  "1402": "luxury_double",

  // 1 Местный ул. 1 кат. (душ) (single_improved)
  "2218": "single_improved",
  "2222": "single_improved",
  "2318": "single_improved",
  "2322": "single_improved",

  // Люкс (luxury)
  "2201": "luxury",
  "2203": "luxury",
  "2205": "luxury",
  "2207": "luxury",

  // Семейный ул. 1 кат. (душ) (family_improved)
  "2220": "family_improved",
  "2224": "family_improved",
};

// Helper function to get room type from room number
function getRoomTypeFromNumber(roomNumber: string): Room["type"] {
  return roomTypeMapping[roomNumber] || "double"; // default to double if not found
}

// Helper function to get building from room number (first digit)
function getBuildingFromNumber(roomNumber: string): string {
  const firstDigit = roomNumber.charAt(0);
  return firstDigit === "1" ? "1" : "2";
}

// Helper function to get floor from room number (second digit)
function getFloorFromNumber(roomNumber: string): number {
  const secondDigit = roomNumber.charAt(1);
  return parseInt(secondDigit) || 1;
}

// Helper function to get capacity based on room type
function getCapacityFromType(type: Room["type"]): number {
  switch (type) {
    case "single":
    case "single_improved":
      return 1;
    case "double":
    case "double_improved":
    case "luxury_double":
      return 2;
    case "family":
    case "family_improved":
      return 3;
    case "luxury":
      return 4;
    default:
      return 2;
  }
}

// Generate rooms based on the mapping
const generateRooms = (): Room[] => {
  const rooms: Room[] = [];

  Object.keys(roomTypeMapping).forEach((roomNumber, index) => {
    const type = getRoomTypeFromNumber(roomNumber);
    const building = getBuildingFromNumber(roomNumber);
    const floor = getFloorFromNumber(roomNumber);
    const capacity = getCapacityFromType(type);

    // Calculate grid position (8x8 grid per floor)
    const roomsPerFloor = Object.keys(roomTypeMapping).filter(
      (num) =>
        getBuildingFromNumber(num) === building &&
        getFloorFromNumber(num) === floor,
    ).length;

    const positionIndex = Object.keys(roomTypeMapping)
      .filter(
        (num) =>
          getBuildingFromNumber(num) === building &&
          getFloorFromNumber(num) === floor,
      )
      .indexOf(roomNumber);

    const row = Math.floor(positionIndex / 8);
    const col = positionIndex % 8;

    rooms.push({
      id: `room-${roomNumber}`,
      number: roomNumber,
      type: type,
      floor: floor,
      building: building,
      position: { row, col },
      capacity: capacity,
      blocked: false,
      amenities: type.includes("improved")
        ? ["душ", "улучшенная отделка"]
        : type.includes("luxury")
          ? ["люкс", "повышенный комфорт"]
          : type === "family"
            ? ["семейный", "увеличенная площадь"]
            : [],
      pricePerNight: type.includes("luxury")
        ? 5000
        : type.includes("improved")
          ? 3500
          : type === "family"
            ? 4000
            : type === "single"
              ? 2000
              : 2500,
    });
  });

  return rooms.sort((a, b) => {
    // Sort by building, then floor, then room number
    if (a.building !== b.building) {
      return a.building.localeCompare(b.building);
    }
    if (a.floor !== b.floor) {
      return a.floor - b.floor;
    }
    return a.number.localeCompare(b.number);
  });
};

export const rooms = generateRooms();

// Export helper functions for use in other components
export {
  getRoomTypeFromNumber,
  getBuildingFromNumber,
  getFloorFromNumber,
  getCapacityFromType,
  roomTypeMapping,
};
