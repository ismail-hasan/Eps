/** @type {import('tailwindcss').Config} */
module.exports = {
      content: [
            "./app/**/*.{js,jsx,ts,tsx}",
            "./components/**/*.{js,jsx,ts,tsx}",
            "./src/**/*.{js,jsx,ts,tsx}", // যদি src ফোল্ডার ব্যবহার করে থাকেন
      ],
      presets: [require("nativewind/preset")],
      theme: {
            extend: {},
      },
      plugins: [],
}