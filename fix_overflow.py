with open('src/components/CityHotelsClient.tsx', 'r') as f:
    content = f.read()

# Fix overflow-hidden on the card
content = content.replace(
    'className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300 transition-all flex flex-col group scroll-mt-24"',
    'className="bg-white rounded-2xl border border-border shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300 transition-all flex flex-col group scroll-mt-24"'
)

# Fix overflow-hidden on the image container, but keep rounded top
content = content.replace(
    '<div className="relative overflow-hidden aspect-[16/10]">',
    '<div className="relative aspect-[16/10] rounded-t-2xl overflow-hidden">'
)
# Wait, if I keep overflow-hidden on the image container, the popover will still be clipped.
# Let's remove overflow-hidden from image container, and let the image have rounded-t-2xl.
content = content.replace(
    '<div className="relative aspect-[16/10] rounded-t-2xl overflow-hidden">',
    '<div className="relative aspect-[16/10]">'
)
content = content.replace(
    '<div className="relative overflow-hidden aspect-[16/10]">',
    '<div className="relative aspect-[16/10]">'
)

# Apply rounded-t-2xl to ProgressiveImage
content = content.replace(
    'className="group-hover:scale-105 transition-transform duration-500"',
    'className="group-hover:scale-105 transition-transform duration-500 rounded-t-2xl object-cover"'
)

# Ensure the popover works on click by changing it to focus-within? The user requested 'on click'. A quick tailwind trick is `group-focus/tooltip:opacity-100` with a tabindex.
# I already wrote it as a hover tooltip. Let's make it appear on both hover and focus.
content = content.replace(
    'group-hover/tooltip:opacity-100 group-hover/tooltip:visible',
    'group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible'
)

# Replace the i button to be a real button that can be clicked/focused
content = content.replace(
    '<span className="ml-0.5 opacity-80 group-hover/tooltip:opacity-100 bg-emerald-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">i</span>',
    '<button type="button" className="ml-0.5 opacity-80 hover:opacity-100 focus:opacity-100 bg-emerald-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px] outline-none">i</button>'
)

with open('src/components/CityHotelsClient.tsx', 'w') as f:
    f.write(content)
