function coordsLookWrong(value) {
  const parts = String(value || "").split(",");
  if (parts.length !== 2) return true;
  return parts.some((p) => p.trim() === "" || Number.isNaN(Number(p)));
}

function run(input) {
  const fields = input?.trmnl?.plugin_settings?.custom_fields_values || {};
  const apiError =
    input?.detailedError?.message ||
    input?.error?.detailedError?.message ||
    input?.error?.message ||
    null;

  if (apiError || !Array.isArray(input?.routes) || input.routes.length === 0) {
    let hint = apiError || "No route found for that arrival time.";

    if (coordsLookWrong(fields.origin) || coordsLookWrong(fields.destination)) {
      hint = "Origin and destination must be lat,lng (e.g. 38.827864,-9.170433).";
    }

    return {
      plugin_ok: false,
      has_error: true,
      error_message: hint,
      routes: [],
    };
  }

  const routes = input.routes.map((r) => {
    const roads = [];
    for (const instr of r.guidance?.instructions || []) {
      if (instr.roadNumbers?.length) roads.push(...instr.roadNumbers);
    }

    return {
      summary: r.summary || {},
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

  return { plugin_ok: true, has_error: false, error_message: "", routes };
}