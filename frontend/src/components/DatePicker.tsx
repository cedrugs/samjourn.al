import { useState } from "react";

interface DatePickerProps {
	value: string;
	onChange: (date: string) => void;
	disabled?: boolean;
}

export function DatePicker({ value, onChange, disabled }: DatePickerProps) {
	const [open, setOpen] = useState(false);
	const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());

	const selected = value ? new Date(value) : null;
	const today = new Date();

	const year = viewDate.getFullYear();
	const month = viewDate.getMonth();

	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const days: (number | null)[] = [];
	for (let i = 0; i < firstDay; i++) days.push(null);
	for (let i = 1; i <= daysInMonth; i++) days.push(i);

	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	const selectDate = (day: number) => {
		const d = new Date(year, month, day);
		onChange(d.toISOString().split("T")[0]!);
		setOpen(false);
	};

	const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
	const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

	const formatDisplay = (dateStr: string) => {
		const d = new Date(dateStr);
		return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => !disabled && setOpen(!open)}
				disabled={disabled}
				className="w-full h-10 bg-bg-secondary border border-border px-3 text-left text-text disabled:opacity-50"
			>
				{value ? formatDisplay(value) : "Select date"}
			</button>
			{open && (
				<div className="absolute z-50 mt-1 bg-bg-secondary border border-border p-3 w-64">
					<div className="flex justify-between items-center mb-2">
						<button type="button" onClick={prevMonth} className="text-text-muted hover:text-text px-2">←</button>
						<span className="text-text">{monthNames[month]} {year}</span>
						<button type="button" onClick={nextMonth} className="text-text-muted hover:text-text px-2">→</button>
					</div>
					<div className="grid grid-cols-7 gap-1 text-center text-xs">
						{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
							<div key={d} className="text-text-muted py-1">{d}</div>
						))}
						{days.map((day, i) => (
							<button
								key={i}
								type="button"
								onClick={() => day && selectDate(day)}
								disabled={!day}
								className={`py-1 ${!day ? "" : 
									selected && day === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear()
										? "bg-accent text-white"
										: day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
											? "text-accent"
											: "text-text hover:bg-border"
								}`}
							>
								{day || ""}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
