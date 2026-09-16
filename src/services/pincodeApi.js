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
 * IP-based geolocation fallback
 * Works on all computers and browsers even when GPS is disabled or denied
 */

export async function getIpBasedLocation() {
  try {
    // 1. Try ipwho.is (very reliable in India with postal codes)
    const ipRes = await fetch('https://ipwho.is/');
    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data && data.success) {
        const postal = data.postal ? data.postal.replace(/\s+/g, '') : '';
        const city = data.city || '';
        const state = data.region || '';
        const area = data.city || '';

        if (postal && /^\d{6}$/.test(postal)) {
          const pinDetails = await searchByPincode(postal);
          return {
            success: true,
            pincode: postal,
            areaName: area,
            city: city,
            state: state,
            displayName: `${city}, ${state} (Detected via Network IP)`,
            details: pinDetails.success ? pinDetails.data : [],
            source: 'Network IP',
          };
        } else if (city) {
          const areaDetails = await searchByArea(city);
          return {
            success: areaDetails.success,
            pincode: areaDetails.data[0]?.pincode || '',
            areaName: area,
            city: city,
            state: state,
            displayName: `${city}, ${state} (Detected via Network IP)`,
            details: areaDetails.data,
            source: 'Network IP Area',
          };
        }
      }
    }
  } catch (err) {
    console.warn('ipwho.is lookup failed, trying BigDataCloud client IP...', err);
  }

  // 2. Fallback to BigDataCloud client IP
  try {
    const bdcRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const postal = bdcData.postcode ? bdcData.postcode.replace(/\s+/g, '') : '';
      const city = bdcData.city || bdcData.locality || '';
      const state = bdcData.principalSubdivision || '';

      if (postal && /^\d{6}$/.test(postal)) {
        const pinDetails = await searchByPincode(postal);
        return {
          success: true,
          pincode: postal,
          areaName: city,
          city: city,
          state: state,
          displayName: `${city}, ${state} (Detected via Network IP)`,
          details: pinDetails.success ? pinDetails.data : [],
          source: 'BDC Network IP',
        };
      } else if (city) {
        const areaDetails = await searchByArea(city);
        return {
          success: areaDetails.success,
          pincode: areaDetails.data[0]?.pincode || '',
          areaName: city,
          city: city,
          state: state,
          displayName: `${city}, ${state} (Detected via Network IP)`,
          details: areaDetails.data,
          source: 'BDC Network IP Area',
        };
      }
    }
  } catch (err) {
    console.error('All IP location lookups failed:', err);
  }

  return {
    success: false,
    message: 'Could not detect your location automatically. Please search manually by entering your city or area name above.',
  };
}

/**
 * Reverse geocoding from Latitude & Longitude to find live area and PIN code
 * First tries BigDataCloud & Nominatim, then seamlessly falls back to IP location
 */
export async function getLiveLocationPinCode(latitude, longitude) {
  // 1. First try BigDataCloud (fast, CORS-friendly, no User-Agent restrictions)
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
          areaName: area || city,
          city: city,
          state: state,
          displayName: `${area ? area + ', ' : ''}${city}, ${state}`,
          details: pinDetails.success ? pinDetails.data : [],
          source: 'GPS',
        };
      } else if (area || city) {
        const target = area || city;
        const areaDetails = await searchByArea(target);
        if (areaDetails.success && areaDetails.data.length > 0) {
          return {
            success: true,
            pincode: areaDetails.data[0]?.pincode || '',
            areaName: target,
            city: city,
            state: state,
            displayName: `${target}, ${state}`,
            details: areaDetails.data,
            source: 'GPS Area',
          };
        }
      }
    }
  } catch (e) {
    console.warn('BigDataCloud coordinate reverse geocode error:', e);
  }

  // 2. Try OpenStreetMap Nominatim
  try {
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    );

    if (nominatimRes.ok) {
      const geoData = await nominatimRes.json();
      const addr = geoData.address || {};
      const postcode = addr.postcode ? addr.postcode.replace(/\s+/g, '') : null;
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || '';
      const city = addr.city || addr.town || addr.village || addr.state_district || '';
      const state = addr.state || '';

      if (postcode && /^\d{6}$/.test(postcode)) {
        const pinDetails = await searchByPincode(postcode);
        return {
          success: true,
          pincode: postcode,
          areaName: suburb || city,
          city: city,
          state: state,
          displayName: geoData.display_name,
          details: pinDetails.success ? pinDetails.data : [],
          source: 'GPS Nominatim',
        };
      } else if (suburb || city) {
        const areaToSearch = suburb || city;
        const areaDetails = await searchByArea(areaToSearch);
        if (areaDetails.success && areaDetails.data.length > 0) {
          return {
            success: true,
            pincode: areaDetails.data[0]?.pincode || '',
            areaName: areaToSearch,
            city: city,
            state: state,
            displayName: geoData.display_name,
            details: areaDetails.data,
            source: 'GPS Area Search',
          };
        }
      }
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode error:', e);
  }

  // 3. If GPS reverse geocoding did not return a PIN, fallback to IP location
  return await getIpBasedLocation();
}

