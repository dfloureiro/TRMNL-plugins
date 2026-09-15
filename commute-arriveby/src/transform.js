function field(input, key) {
  return (
    input[key] ??
    input.trmnl?.plugin_settings?.custom_fields_values?.[key] ??
    ""
  );
}

async function run(input) {
  const key = field(input, "tomtom_api_key");
  const origin = field(input, "origin");
  const destination = field(input, "destination");

  const url =
    "https://api.tomtom.com/routing/1/calculateRoute/" +
    encodeURIComponent(origin) +
    ":" +
    encodeURIComponent(destination) +
    "/json?key=" +
    encodeURIComponent(key) +
    "&traffic=true&maxAlternatives=2&routeType=fastest" +
    "&computeTravelTimeFor=all&sectionType=traffic" +
    "&instructionsType=coded&travelMode=car&routeRepresentation=summaryOnly";

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    return { error: data, routes: [] };
  }

  const routes = (data.routes || []).map((r) => {
    const roads = [];
    for (const instr of r.guidance?.instructions || []) {
      if (instr.roadNumbers?.length) roads.push(...instr.roadNumbers);
    }

    return {
      summary: r.summary,
      sections: (r.sections || [])
        .filter((s) => s.sectionType === "TRAFFIC")
        .map((s) => ({
          sectionType: s.sectionType,
          magnitudeOfDelay: s.magnitudeOfDelay,
        })),
      guidance: {
        instructions: [...new Set(roads)].map((n) => ({ roadNumbers: [n] })),
      },
    };
  });

  return { routes };
}