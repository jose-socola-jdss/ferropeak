import { gsap } from "gsap";

// Mobile Navigation Toggle
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-button");
  const navMenu = document.getElementById("nav-menu");
  const header = document.querySelector(".site-header");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      header.classList.toggle("menu-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        header.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Footer Year
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  // Count-up Scroll Animation with GSAP
  const countElements = document.querySelectorAll(".metric-big");
  if (countElements.length > 0) {
    const observerOptions = { threshold: 0.5 };
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        const targetValue = parseFloat(target.dataset.target || "0");
        const suffix = target.dataset.suffix || "";

        const counterObj = { val: 0 };
        gsap.to(counterObj, {
          val: targetValue,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            target.textContent = `${Math.round(counterObj.val)}${suffix}`;
          },
        });
        obs.unobserve(target);
      });
    }, observerOptions);

    countElements.forEach((el) => counterObserver.observe(el));
  }

  // GSAP Hero Entry motion
  gsap.from(".hero-title, .badge, .hero-lead, .hero-actions", {
    y: 35,
    opacity: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });

  gsap.from(".visual-industrial", {
    x: 40,
    opacity: 0,
    duration: 1.3,
    ease: "power2.out",
  });
});

// Custom Web Component for RPE Calculator
class FerropeakCalculator extends HTMLElement {
  constructor() {
    super();
    this.oneRepMax = 100;
    this.reps = 5;
    this.rpe = 8;
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.calculate();
  }

  render() {
    this.innerHTML = `
      <div class="calc-row">
        <label for="calc-orm">
          1RM Estimado (Carga Máxima para 1 repetición)
          <span class="calc-val" id="val-orm">100 kg</span>
        </label>
        <input type="range" id="calc-orm" min="40" max="300" step="2.5" value="${this.oneRepMax}" />
      </div>

      <div class="calc-row">
        <label for="calc-reps">
          Repeticiones de objetivo
          <span class="calc-val" id="val-reps">5 reps</span>
        </label>
        <input type="range" id="calc-reps" min="1" max="12" step="1" value="${this.reps}" />
      </div>

      <div class="calc-row">
        <label for="calc-rpe">
          Esfuerzo Objetivo (RPE)
          <span class="calc-val" id="val-rpe">8.0 RPE</span>
        </label>
        <input type="range" id="calc-rpe" min="6" max="10" step="0.5" value="${this.rpe}" />
      </div>

      <div class="calc-results">
        <div class="calc-box highlight">
          <span>Peso sugerido</span>
          <strong id="res-weight">0 kg</strong>
        </div>
        <div class="calc-box">
          <span>Intensidad</span>
          <strong id="res-intensity">0%</strong>
        </div>
      </div>
    `;
  }

  setupListeners() {
    const ormInput = this.querySelector("#calc-orm");
    const repsInput = this.querySelector("#calc-reps");
    const rpeInput = this.querySelector("#calc-rpe");

    ormInput.addEventListener("input", (e) => {
      this.oneRepMax = parseFloat(e.target.value);
      this.querySelector("#val-orm").textContent = `${this.oneRepMax} kg`;
      this.calculate();
    });

    repsInput.addEventListener("input", (e) => {
      this.reps = parseInt(e.target.value, 10);
      this.querySelector("#val-reps").textContent = `${this.reps} reps`;
      this.calculate();
    });

    rpeInput.addEventListener("input", (e) => {
      this.rpe = parseFloat(e.target.value);
      this.querySelector("#val-rpe").textContent = `${this.rpe.toFixed(1)} RPE`;
      this.calculate();
    });
  }

  calculate() {
    // Estimating relative intensity percentage based on reps (at RPE 10)
    // 1RM Rep percentage scale
    const repPercentages = {
      1: 1.00,
      2: 0.95,
      3: 0.92,
      4: 0.89,
      5: 0.86,
      6: 0.83,
      7: 0.81,
      8: 0.79,
      9: 0.76,
      10: 0.74,
      11: 0.71,
      12: 0.68
    };

    const basePct = repPercentages[this.reps] || 0.70;
    
    // Each RPE drop of 1 point corresponds to roughly 3% reduction in intensity percentage
    const rpeDifference = 10 - this.rpe;
    const finalIntensity = Math.max(0.40, basePct - (rpeDifference * 0.03));
    const targetWeight = this.oneRepMax * finalIntensity;

    // Display updates
    const resWeight = this.querySelector("#res-weight");
    const resIntensity = this.querySelector("#res-intensity");

    gsap.killTweensOf([resWeight, resIntensity]);

    const currentWeight = parseFloat(resWeight.textContent) || 0;
    const currentIntensity = parseInt(resIntensity.textContent, 10) || 0;

    const valObj = { weight: currentWeight, intensity: currentIntensity };

    gsap.to(valObj, {
      weight: targetWeight,
      intensity: finalIntensity * 100,
      duration: 0.4,
      ease: "power1.out",
      onUpdate: () => {
        // Round to nearest 2.5kg for realistic weight plates loading
        const roundedWeight = Math.round(valObj.weight / 2.5) * 2.5;
        resWeight.textContent = `${roundedWeight} kg`;
        resIntensity.textContent = `${Math.round(valObj.intensity)}%`;
      }
    });
  }
}

customElements.define("ferropeak-calculator", FerropeakCalculator);
