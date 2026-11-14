/**
 * Optional fleet gate. When FLEET_CONTEXT_ADMISSION_MODULE is unset, provider
 * calls proceed exactly as upstream. The module may throw before any HTTP call.
 */
export async function admitFleetProviderStream(args: {
	model: { id?: string; provider?: string };
	context: unknown;
	options: unknown;
}): Promise<void> {
	const specifier = process.env.FLEET_CONTEXT_ADMISSION_MODULE?.trim();
	if (!specifier) return;
	let gate: { admitProviderStream?: (input: typeof args) => Promise<void> };
	try {
		gate = (await import(specifier)) as { admitProviderStream?: (input: typeof args) => Promise<void> };
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(
			`FLEET_ADMISSION_STOP: context counter is unavailable (${detail}). No model call was sent.`,
		);
	}
	if (typeof gate.admitProviderStream !== "function") {
		throw new Error(
			"FLEET_ADMISSION_STOP: context counter is unavailable. No model call was sent.",
		);
	}
	await gate.admitProviderStream(args);
}
