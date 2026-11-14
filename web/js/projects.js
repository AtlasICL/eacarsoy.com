/**
 * Project grid: clicking a card opens a modal with the full project details.
 * The URL hash is updated (e.g. /projects#whatdidi) so individual
 * projects can be linked to directly.
 */
const getModal = (slug) => document.getElementById("project-" + slug);

function openProject(slug) {
  const modal = getModal(slug);
  if (!modal || modal.open) return;
  modal.showModal();
  modal.querySelector(".modal-body").scrollTop = 0;
  history.replaceState(null, "", "#" + slug);
}

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".project-card");

  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();
      openProject(card.dataset.project);
    });
  });

  document.querySelectorAll(".project-modal").forEach((modal) => {
    modal
      .querySelector(".modal-close")
      .addEventListener("click", () => modal.close());

    // Clicking the dimmed backdrop (outside the dialog box) closes it
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });

    // Clear the hash once the modal is closed (via button, backdrop or Esc)
    modal.addEventListener("close", () => {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    });
  });

  // Open a project directly if the page was loaded with its hash
  const initial = window.location.hash.slice(1);
  if (initial) openProject(initial);
});
