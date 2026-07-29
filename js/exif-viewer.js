(function () {
  const fileInput = document.getElementById('exifFileInput');
  const selectBtn = document.getElementById('exifSelectBtn');
  const fileName = document.getElementById('exifFileName');
  const resultsBox = document.getElementById('exifResults');
  const grid = document.getElementById('exifGrid');
  const gpsLink = document.getElementById('exifGpsLink');

  selectBtn.addEventListener('click', () => fileInput.click());

  function toDecimal(gpsArray, ref) {
    if (!gpsArray) return null;
    let decimal = gpsArray[0] + gpsArray[1] / 60 + gpsArray[2] / 3600;
    if (ref === 'S' || ref === 'W') decimal *= -1;
    return decimal;
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    fileName.textContent = file.name;
    resultsBox.style.display = 'none';
    gpsLink.innerHTML = '';

    EXIF.getData(file, function () {
      const allTags = EXIF.getAllTags(this);
      const interesting = [
        'Make', 'Model', 'DateTimeOriginal', 'DateTime', 'Software',
        'ExposureTime', 'FNumber', 'ISOSpeedRatings', 'FocalLength',
        'PixelXDimension', 'PixelYDimension', 'Orientation'
      ];

      const rows = interesting
        .filter(key => allTags[key] !== undefined)
        .map(key => `
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-glow);padding-bottom:0.5rem;">
            <span style="color:var(--text-dim);">${key}</span>
            <span style="color:var(--cyan);">${allTags[key]}</span>
          </div>`);

      if (rows.length === 0) {
        grid.innerHTML = '<p style="color:var(--success);">✅ No identifying EXIF metadata found — likely stripped already (common on social media uploads).</p>';
      } else {
        grid.innerHTML = rows.join('');
      }

      const lat = toDecimal(allTags.GPSLatitude, allTags.GPSLatitudeRef);
      const lon = toDecimal(allTags.GPSLongitude, allTags.GPSLongitudeRef);

      if (lat && lon) {
        gpsLink.innerHTML = `
          <div style="padding:0.8rem 1rem;background:rgba(239,68,68,0.1);border-left:3px solid var(--danger);border-radius:6px;">
            ⚠️ <strong>GPS location found:</strong> ${lat.toFixed(6)}, ${lon.toFixed(6)}
            — <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" style="color:var(--cyan);">View on map</a>
          </div>`;
      }

      resultsBox.style.display = 'block';
    });
  });
})();