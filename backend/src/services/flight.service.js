  const axios = require("axios");
  require("dotenv").config();


  const flightCache = {};
  const CACHE_TTL = 5 * 60 * 1000;

  function durationToMinutes(duration = "") {
    const h = duration.match(/(\d+)H/);
    const m = duration.match(/(\d+)M/);
    return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) * 60 : 0);
  }

  async function getToken() {
    const res = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return res.data.access_token;
  }


  async function getFastestFlight(date) {

  
    if (
      flightCache[date] &&
      Date.now() - flightCache[date].time < CACHE_TTL
    ) {
      return flightCache[date].data;
    }

    try {
      const token = await getToken();

      const apiRes = await axios.get(
        "https://test.api.amadeus.com/v2/shopping/flight-offers",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            originLocationCode: "PNQ",
            destinationLocationCode: "BOM",
            departureDate: date, 
            adults: 1
          }
        }
      );

      const offers = apiRes.data?.data;
      if (!offers || offers.length === 0) {
        throw new Error("No flight data available");
      }

      const fastest = offers
        .map(offer => {
          const itinerary = offer.itineraries?.[0];
          if (!itinerary) return null;

          const segments = itinerary.segments;

          return {
            mode: "Flight",
            name: segments.map(s => `${s.carrierCode}${s.number}`).join(" → "),
            departure: segments[0].departure.at,
            arrival: segments[segments.length - 1].arrival.at,
            durationMinutes: durationToMinutes(itinerary.duration)
          };
        })
        .filter(Boolean)
        .reduce((min, f) =>
          f.durationMinutes < min.durationMinutes ? f : min
        );

    
      flightCache[date] = {
        data: fastest,
        time: Date.now()
      };

      return fastest;

    } catch (err) {
      console.error("Flight API error:", err.message);
      throw new Error("Flight service unavailable");
    }
  }

  module.exports = { getFastestFlight };
