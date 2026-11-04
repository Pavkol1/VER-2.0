# Room Service Email Design

The chosen live approach is standard Netlify Forms email with one plain-text
order summary and no order reference. See `room-service.txt` for sample content;
Netlify still adds its own email wrapper and field labels. The HTML below is
retained as an unused design alternative, not the active notification template.

The live subject is `Room 204 · Room service · €22.00`, set by the page's
hidden `subject` field.

Open `room-service.html` directly in a browser. It contains clearly marked
sample data and does not send email or change Netlify notification settings.
It was drawn while orders still carried a reference (`RS-DEMO00000001` in the
sample). The live page has since dropped references, so remove that line if
this design is ever used.

The design uses a 600px table layout, inline core styles, system fonts, and an
Outlook desktop width wrapper. The header uses the original Stories logo,
copied into `assets/stories-logo.jpg`. The source,
`archive/source-assets/photos/LOGO/stories logo.jpg`, exists only on the
MacBook. The email uses its monochrome dark derivative,
`assets/stories-logo-dark.png`, rendered at double resolution.
It does not depend on SVG support, scripts, or external fonts.
The small-screen media query adjusts spacing; the fluid table remains usable
without it. Actual Outlook and mobile email rendering still needs inbox testing.

Before integration:

- Replace sample values with HTML-escaped order snapshot values.
- Render every requested dish, quantity, selected options, and line amount.
- Match the subject to the live one (room · Room service · total), unless order
  references are brought back on the page and the guest receipt as well.
- Format the submitted timestamp in Europe/Budapest, including the zone.
- Render guest notes as escaped text with preserved line breaks; omit the notes
  band for an empty value rather than inventing an allergy status.
- Remove the design-preview footer from actual messages.
- Replace the logo's relative URL with an absolute HTTPS URL or a matching CID
  attachment when connecting an email sender. Keep its alt text for blocked images.
- Send a matching plain-text alternative and test both in Outlook.
- Keep payment, delivery time, and kitchen acceptance claims out of the template
  unless the hotel confirms them.

This is a design artifact outside Netlify's `Ver3/` publish directory. Connecting
an email sender is a separate step; built-in Netlify email notifications remain
unchanged.
