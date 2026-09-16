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
            latitude: data.latitude ? Number(data.latitude) : null,
            longitude: data.longitude ? Number(data.longitude) : null,
            coordinates: data.latitude && data.longitude ? `${Number(data.latitude).toFixed(4)}°, ${Number(data.longitude).toFixed(4)}°` : null,
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
            latitude: data.latitude ? Number(data.latitude) : null,
            longitude: data.longitude ? Number(data.longitude) : null,
            coordinates: data.latitude && data.longitude ? `${Number(data.latitude).toFixed(4)}°, ${Number(data.longitude).toFixed(4)}°` : null,
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
          latitude: bdcData.latitude ? Number(bdcData.latitude) : null,
          longitude: bdcData.longitude ? Number(bdcData.longitude) : null,
          coordinates: bdcData.latitude && bdcData.longitude ? `${Number(bdcData.latitude).toFixed(4)}°, ${Number(bdcData.longitude).toFixed(4)}°` : null,
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
          latitude: bdcData.latitude ? Number(bdcData.latitude) : null,
          longitude: bdcData.longitude ? Number(bdcData.longitude) : null,
          coordinates: bdcData.latitude && bdcData.longitude ? `${Number(bdcData.latitude).toFixed(4)}°, ${Number(bdcData.longitude).toFixed(4)}°` : null,
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
 */
export async function getLiveLocationPinCode(latitude, longitude) {
  const numLat = Number(latitude);
  const numLon = Number(longitude);
  const coordString = `${numLat.toFixed(4)}°, ${numLon.toFixed(4)}°`;

  // 1. Try OpenStreetMap Nominatim first (detailed postal resolution for India)
  try {
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${numLat}&lon=${numLon}&addressdetails=1`
    );

    if (nominatimRes.ok) {
      const geoData = await nominatimRes.json();
      const addr = geoData.address || {};
      const postcode = addr.postcode ? addr.postcode.replace(/\s+/g, '') : null;
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || addr.subdivision || '';
      const city = addr.city || addr.town || addr.village || addr.state_district || addr.county || '';
      const state = addr.state || '';

      if (postcode && /^\d{6}$/.test(postcode)) {
        const pinDetails = await searchByPincode(postcode);
        return {
          success: true,
          pincode: postcode,
          areaName: suburb || city,
          city: city,
          state: state,
          latitude: numLat,
          longitude: numLon,
          coordinates: coordString,
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
            latitude: numLat,
            longitude: numLon,
            coordinates: coordString,
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

  // 2. Try BigDataCloud
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${numLat}&longitude=${numLon}&localityLanguage=en`
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
          latitude: numLat,
          longitude: numLon,
          coordinates: coordString,
          displayName: `${area ? area + ', ' : ''}${city}, ${state}`,
          details: pinDetails.success ? pinDetails.data : [],
          source: 'GPS BDC',
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
            latitude: numLat,
            longitude: numLon,
            coordinates: coordString,
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

  // 3. If GPS reverse geocoding did not return a PIN, fallback to IP location
  return await getIpBasedLocation();
}

/**
 * Direct search by Latitude and Longitude coordinates
 * @param {string|number} latitude 
 * @param {string|number} longitude 
 */
export async function searchByCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    return {
      success: false,
      message: 'Please enter valid numbers for both Latitude and Longitude.',
      data: [],
    };
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return {
      success: false,
      message: 'Invalid coordinate values. Latitude must be -90 to 90 and Longitude -180 to 180.',
      data: [],
    };
  }

  const result = await getLiveLocationPinCode(lat, lon);
  if (result.success) {
    return {
      success: true,
      count: result.details ? result.details.length : 0,
      message: `Found location: ${result.areaName || result.city}, ${result.state} (PIN: ${result.pincode})`,
      pincode: result.pincode,
      areaName: result.areaName,
      city: result.city,
      state: result.state,
      latitude: lat,
      longitude: lon,
      coordinates: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
      data: result.details || [],
    };
  }

  return {
    success: false,
    count: 0,
    message: result.message || `No PIN code records found for coordinates (${lat}, ${lon}).`,
    data: [],
  };
}


