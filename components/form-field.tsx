export function FormField({
  label,
  ...props
}: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        required
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        {...props}
      />
    </label>
  );
}
