
/** @jest-environment jsdom */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Countdown from "./Countdown";

jest.useFakeTimers();

describe("Countdown Component", () => {
    it("renders with the initial formatted time", () => {
        // 1 hour, 1 minute, 1 second = 3661000 ms
        // Formatted: 01:01:01
        render(<Countdown timeRemaining={3661000} />);
        expect(screen.getByText(/01:01:01/i)).toBeInTheDocument();
    });

    it("decrements time normally", () => {
        render(<Countdown timeRemaining={10000} />); // 10 seconds
        expect(screen.getByText(/00:00:10/i)).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(screen.getByText(/00:00:09/i)).toBeInTheDocument();
    });

    it("calls onFinish when time runs out", () => {
        const onFinish = jest.fn();
        render(<Countdown timeRemaining={1000} onFinish={onFinish} />);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(onFinish).toHaveBeenCalled();
        expect(screen.getByText(/00:00:00/i)).toBeInTheDocument();
    });

    it("handles throttling/time-jumps correctly (The Fix)", () => {
        // This test simulates the browser tab lagging.
        // We want to prove that if real time advances by 30s,
        // but the interval only fires once (e.g. at the end), the timer updates by 30s.

        // 1. Setup real Start Time
        const startTime = 1000000000000;
        jest.setSystemTime(startTime);

        // 2. Render with 60s remaining
        render(<Countdown timeRemaining={60000} />);
        expect(screen.getByText(/00:01:00/i)).toBeInTheDocument();

        // 3. Simulate "Browser Background" scenario:
        // Real time jumps forward by 30 seconds...
        jest.setSystemTime(startTime + 30000);

        // ... but the interval tick only happens ONCE (simulating throttling)
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // 4. Verification
        // OLD CODE: Would have only subtracted 1 second -> 00:00:59
        // NEW CODE: Calculates (Target - Now) -> 60s - 30s (+1s tick logic) = ~29s
        expect(screen.getByText(/00:00:29/i)).toBeInTheDocument();
    });
});


