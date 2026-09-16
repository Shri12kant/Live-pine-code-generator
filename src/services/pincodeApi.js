// In-memory cache for fast repeated queries
const cache = new Map();

/**
 * Normalizes a post office record from the India Post API
 */
const normalizePostOffice = (item) => ({
  name: item.Name || 'Unknown Post Office',
  pincode: item.Pincode || '',
  district: item.District || '',
  state: item.State || '',
  division: item.Division || '',
  circle: item.Circle || '',
  region: item.Region || '',
  branchType: item.BranchType || 'Sub Post Office',
  deliveryStatus: item.DeliveryStatus || 'Delivery',
  country: item.Country || 'India',
  description: item.Description || '',
});

/**
 * Search post offices by City, Locality, or Area name
 * @param {string} areaName 
 */
export async function searchByArea(areaName) {
  const cleanQuery = areaName.trim();
  if (!cleanQuery || cleanQuery.length < 2) {
    return { success: false, message: 'Please enter at least 2 characters.', data: [] };
  }

  const cacheKey = `area:${cleanQuery.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(cleanQuery)}`);
    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }
    const data = await res.json();
    const result = data[0];

    if (result && result.Status === 'Success' && Array.isArray(result.PostOffice) && result.PostOffice.length > 0) {
      const normalized = result.PostOffice.map(normalizePostOffice);
      const response = {
        success: true,
        count: normalized.length,
        message: result.Message || `Found ${normalized.length} post office(s).`,
        data: normalized,
      };
      cache.set(cacheKey, response);
      return response;
    } else {
      const response = {
        success: false,
        count: 0,
        message: result?.Message || `No PIN codes found for "${cleanQuery}". Try checking the spelling or searching a nearby larger area.`,
        data: [],
      };
      return response;
    }
  } catch (err) {
    console.error('Error searching area:', err);
    return {
      success: false,
      count: 0,
      message: 'Failed to fetch PIN code data. Please check your internet connection and try again.',
      data: [],
    };
  }
}

/**
 * Search post offices by 6-digit PIN code
 * @param {string} pincode 
 */
export async function searchByPincode(pincode) {
  const cleanPin = pincode.toString().trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return { success: false, message: 'Please enter a valid 6-digit PIN code.', data: [] };
  }

  const cacheKey = `pin:${cleanPin}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }
    const data = await res.json();
    const result = data[0];

    if (result && result.Status === 'Success' && Array.isArray(result.PostOffice) && result.PostOffice.length > 0) {
      const normalized = result.PostOffice.map(normalizePostOffice);
      const response = {
        success: true,
        count: normalized.length,
        message: result.Message || `Found ${normalized.length} post office(s) under PIN ${cleanPin}.`,
        data: normalized,
      };
      cache.set(cacheKey, response);
      return response;
    } else {
      return {
        success: false,
        count: 0,
        message: result?.Message || `No records found for PIN code ${cleanPin}.`,
        data: [],
      };
    }
  } catch (err) {
    console.error('Error searching PIN code:', err);
    return {
      success: false,
      count: 0,
      message: 'Network error while fetching PIN code. Please try again.',
      data: [],
    };
  }
}

/**
 * Reverse geocoding from Latitude & Longitude to find live area and PIN code
 * Uses OpenStreetMap Nominatim and BigDataCloud as fallback
 */
export async function getLiveLocationPinCode(latitude, longitude) {
  try {
    // 1. Try OpenStreetMap Nominatim
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (nominatimRes.ok) {
      const geoData = await nominatimRes.json();
      const addr = geoData.address || {};
      const postcode = addr.postcode ? addr.postcode.replace(/\s+/g, '') : null;
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || addr.subdivision || '';
      const city = addr.city || addr.town || addr.village || addr.state_district || addr.county || '';
      const state = addr.state || '';

      if (postcode && /^\d{6}$/.test(postcode)) {
        // Fetch detailed post office records for this live pincode
        const pinDetails = await searchByPincode(postcode);
        return {
          success: true,
          pincode: postcode,
          areaName: suburb || city,
          city: city,
          state: state,
          displayName: geoData.display_name,
          details: pinDetails.success ? pinDetails.data : [],
          source: 'Nominatim GPS',
        };
      } else if (suburb || city) {
        // Postcode missing in OSM, search area by name
        const areaToSearch = suburb || city;
        const areaDetails = await searchByArea(areaToSearch);
        return {
          success: areaDetails.success,
          pincode: areaDetails.data[0]?.pincode || '',
          areaName: areaToSearch,
          city: city,
          state: state,
          displayName: geoData.display_name,
          details: areaDetails.data,
          source: 'Nominatim Area Search',
        };
      }
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode failed, attempting fallback...', e);
  }

  // 2. Fallback to BigDataCloud
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const postcode = bdcData.postcode ? bdcData.postcode.replace(/\s+/g, '') : '';
      const area = bdcData.locality || bdcData.city || '';
      const city = bdcData.city || bdcData.locality || '';
      const state = bdcData.principalSubdivision || '';

      if (postcode && /^\d{6}$/.test(postcode)) {
        const pinDetails = await searchByPincode(postcode);
        return {
          success: true,
          pincode: postcode,
          areaName: area,
          city: city,
          state: state,
          displayName: `${area}, ${city}, ${state}`,
          details: pinDetails.success ? pinDetails.data : [],
          source: 'BigDataCloud GPS',
        };
      } else if (area) {
        const areaDetails = await searchByArea(area);
        return {
          success: areaDetails.success,
          pincode: areaDetails.data[0]?.pincode || '',
          areaName: area,
          city: city,
          state: state,
          displayName: `${area}, ${city}, ${state}`,
          details: areaDetails.data,
          source: 'BigDataCloud Area Search',
        };
      }
    }
  } catch (e) {
    console.error('BigDataCloud fallback also failed:', e);
  }

  return {
    success: false,
    message: 'Could not pinpoint PIN code from your GPS coordinates. Please search manually by entering your city or area name above.',
  };
}
