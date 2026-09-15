function run(input) {
  const apiError =
    input?.detailedError?.message ||
    input?.error?.detailedError?.message ||
    input?.error?.message ||
    null;

  if (apiError || !Array.isArray(input?.routes) || input.routes.length === 0) {
    return {
      has_error: true,
      error_message: apiError || "No route found. Check origin, destination, and API key.",
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

  return { has_error: false, error_message: "", routes };
}