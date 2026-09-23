# Profit Navigator

Create a professional Product Pricing Strategy Dashboard using React, Tailwind CSS, and Lucide-react icons.Core Architecture:Dynamic State Management: Build a table where users can dynamically add/remove rows (Products) and columns (Cost Factors).Smart Column System:Default Columns: [Product Name, Base Cost, Shipping, Marketing].Custom Columns: A 'Add Cost Factor' button that creates a new numeric column and includes it in the Total_Cost calculation automatically.The Golden Pricing Logic (3x Rule):Calculate Total_Cost = sum of all cost columns.Auto-generate an 'Ideal Price' column ($Total\_Cost \times 3$).Include a 'Actual Selling Price' input column.Visual Status Indicator (Real-time): Apply conditional formatting to the 'Actual Selling Price' cell:Emerald Green: If price $\ge 2.8 \times$ Total Cost.Amber/Yellow: If price is between $2 \times$ and $2.7 \times$ Total Cost.Crimson Red: If price $< 1.8 \times$ Total Cost (Warning: Low Margin).Interactive Sidebar Analytics: When a row is selected, show a sidebar with:ROI % (Return on Investment).Net Profit Value ($Selling\_Price - Total\_Cost$).Break-even Point analysis.UI/UX: Modern Dark Mode aesthetic (Slate-900 background), glassmorphism effects for the sidebar, and smooth transitions. Make it look like a high-end SaaS tool."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pricing-spark-83.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5534c5e3-55f7-4ad7-b4c9-52c486e91769).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
