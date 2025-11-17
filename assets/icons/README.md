# Icon Placeholders

Since we can't generate actual PNG images in this environment, you'll need to create the icon files.

## Required Icons
- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Design Guidelines

### Icon Design
- **Primary Color**: #6200ea (Purple)
- **Accent Color**: #03dac6 (Teal)
- **Theme**: Brain/Psychology symbol representing focus
- **Style**: Material Design, flat with subtle shadows

### How to Create Icons

#### Option 1: Using Online Tools
1. Use a tool like [Figma](https://figma.com), [Canva](https://canva.com), or [Photopea](https://photopea.com)
2. Create a 128x128 canvas
3. Design a brain or focus icon with the colors above
4. Export as PNG at different sizes (16, 32, 48, 128)

#### Option 2: Convert SVG
1. Use the provided `icon128.svg` file
2. Use an online SVG to PNG converter like [CloudConvert](https://cloudconvert.com/svg-to-png)
3. Convert to all required sizes

#### Option 3: Use Font Awesome or Material Icons
1. Download the "psychology" or "psychology_alt" icon from Material Icons
2. Color it with #6200ea
3. Export at required sizes

#### Option 4: Quick Placeholder
For development purposes, you can use a solid colored square:
- Create a 128x128 purple square (#6200ea)
- Add white text "DD" in the center
- Resize to create all sizes

### Temporary Solution
Place any 128x128 PNG image in the assets/icons folder and duplicate it for all sizes to test the extension. You can replace with proper icons later.

## Example Command (if you have ImageMagick installed)
```bash
# Convert SVG to PNGs (if ImageMagick is available)
magick convert icon128.svg -resize 128x128 icon128.png
magick convert icon128.svg -resize 48x48 icon48.png
magick convert icon128.svg -resize 32x32 icon32.png
magick convert icon128.svg -resize 16x16 icon16.png
```
