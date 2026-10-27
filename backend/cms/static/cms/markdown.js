document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("textarea.rgi-markdown").forEach((input) => {
    const toolbar = document.createElement("div");
    toolbar.className = "rgi-markdown-toolbar";
    [["Heading", "## ", ""], ["Bold", "**", "**"], ["Italic", "*", "*"], ["Link", "[", "](https://)"], ["List", "- ", ""], ["Code", "\n```\n", "\n```\n"]].forEach(([label, before, after]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => {
        const start = input.selectionStart, end = input.selectionEnd;
        const selected = input.value.slice(start, end) || "text";
        input.setRangeText(before + selected + after, start, end, "select");
        input.dispatchEvent(new Event("input", {bubbles:true}));
        input.focus();
      });
      toolbar.appendChild(button);
    });
    input.before(toolbar);
  });
});
