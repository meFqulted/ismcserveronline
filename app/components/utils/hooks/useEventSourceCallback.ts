import { useEffect } from "react";
import { EventSourceOptions, useEventSource } from "remix-utils/sse/react";

export default function useEventSourceCallback(
	url: string | URL,
	eventSourceOptions?: EventSourceOptions,
	callback?: (data: any) => void
) {
	const eventSource = useEventSource(url, eventSourceOptions);

	useEffect(() => {
		if (!eventSource) return;

		let e: any;
		try {
			e = JSON.parse(eventSource);
		} catch (error) {
			console.warn(`Error parsing eventSource to JSON. it's a ${typeof eventSource}.`, eventSource);
			e = eventSource;
			return;
		}

		callback?.(e);
	}, [eventSource]);

	return eventSource;
}
