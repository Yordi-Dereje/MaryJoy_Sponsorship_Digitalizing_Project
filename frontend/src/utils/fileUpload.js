export const setupFileUpload = (previewId, file) => {
  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById(previewId);
    if (preview) {
      if (file.type.startsWith("image/")) {
        preview.innerHTML = `<img src='${e.target.result}' alt='preview' class='w-20 h-20 object-cover rounded-full mx-auto' />`;
      } else {
        preview.innerHTML = `<span class='text-gray-700'>${file.name}</span>`;
      }
    }
  };
  reader.readAsDataURL(file);
};
