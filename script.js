
document.addEventListener("DOMContentLoaded", () => {
    // Automatically update the copyright year
    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Handle the contact form
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");

    if (contactForm && formStatus) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = document.getElementById("visitor-name").value.trim();
            const email = document.getElementById("visitor-email").value.trim();
            const message = document.getElementById("visitor-message").value.trim();

            if (!name || !email || !message) {
                formStatus.textContent = "Please complete all fields.";
                return;
            }

            const subject = encodeURIComponent("Message from Valtrix website");
            const body = encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
            );

            formStatus.textContent =
                "Opening your email app to prepare the message...";

            window.location.href =
                `mailto:?subject=${subject}&body=${body}`;
        });
    }
});