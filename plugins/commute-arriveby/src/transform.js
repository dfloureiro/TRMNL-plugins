function run(input) {
  const routes = (input.routes || []).map((r) => {
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