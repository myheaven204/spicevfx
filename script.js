/* =========================================
   SPICE VFX — Awwwards-Level JavaScript
   Premium interactions, magnetic effects,
   scroll-driven animations, text scramble
   ========================================= */

(function () {
    'use strict';

    // ===== LOADING STATE =====
    const loader = document.getElementById('loader');
    let loadProgress = 0;
    const targetLoad = 100;

    // Create particles for loader
    function createLoaderParticles() {
        const container = document.getElementById('loaderParticles');
        if (!container) return;
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 4 + 's';
            particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            const size = 2 + Math.random() * 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            container.appendChild(particle);
        }
    }
    createLoaderParticles();

    function updateLoaderProgress() {
        const counter = document.querySelector('.loader-counter span');
        if (counter) {
            loadProgress = Math.min(loadProgress + Math.random() * 15 + 5, targetLoad);
            counter.textContent = Math.floor(loadProgress);
        }
        if (loadProgress < targetLoad) {
            requestAnimationFrame(updateLoaderProgress);
        }
    }

    if (loader) {
        window.addEventListener('load', () => {
            updateLoaderProgress();
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.style.overflow = '';
                initHeroAnimation();
            }, 2400);
        });
        document.body.style.overflow = 'hidden';
    }

    // ===== TEXT SCRAMBLE =====
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.originalText = el.textContent;
            this.frame = 0;
            this.frameRequest = null;
            this.queue = [];
            this.resolve = null;
        }

        setText(newText) {
            return new Promise(resolve => {
                const oldText = this.el.textContent;
                const length = Math.max(oldText.length, newText.length);
                const queue = [];
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 40);
                    const end = start + Math.floor(Math.random() * 40);
                    queue.push({ from, to, start, end });
                }
                cancelAnimationFrame(this.frameRequest);
                this.frame = 0;
                this.queue = queue;
                this.resolve = resolve;
                this.animate();
            });
        }

        animate() {
            let output = '';
            let complete = 0;
            for (let i = 0; i < this.queue.length; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span style="color:var(--text-3)">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frame++;
                this.frameRequest = requestAnimationFrame(() => this.animate());
            }
        }

        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    // ===== HERO ANIMATION =====
    function initHeroAnimation() {
        // Animate title lines
        const lines = document.querySelectorAll('.hero-title-line-inner');
        lines.forEach((line, i) => {
            setTimeout(() => line.classList.add('animated'), i * 150);
        });

        // Animate description
        setTimeout(() => {
            const desc = document.querySelector('.hero-desc');
            const actions = document.querySelector('.hero-actions');
            const metrics = document.querySelector('.hero-metrics');
            if (desc) desc.classList.add('animated');
            setTimeout(() => {
                if (actions) actions.classList.add('animated');
                setTimeout(() => {
                    if (metrics) metrics.classList.add('animated');
                    animateCounters();
                }, 100);
            }, 100);
        }, 400);

        // Init text scramble on nav links hover
        document.querySelectorAll('.nav-link').forEach(link => {
            const fx = new TextScramble(link);
            link.addEventListener('mouseenter', () => {
                fx.setText(link.textContent);
            });
        });
    }

    // ===== CANVAS BACKGROUND =====
    const canvas = document.getElementById('bgCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 1.5 + 0.3;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 0.25 + 0.05;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
                this.opacity = Math.random() * 0.25 + 0.03;
                const colors = [
                    '196, 248, 42',
                    '139, 92, 246',
                    '255, 255, 255'
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.life = Math.random() * 300 + 150;
                this.maxLife = this.life;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life--;
                this.pulsePhase += this.pulseSpeed;
                if (this.life <= 0 || this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
                    this.reset();
                }
            }
            draw() {
                const fadeIn = Math.min((this.maxLife - this.life) / 30, 1);
                const fadeOut = Math.min(this.life / 30, 1);
                const pulse = 0.7 + Math.sin(this.pulsePhase) * 0.3;
                const alpha = this.opacity * fadeIn * fadeOut * pulse;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
                ctx.fill();
            }
        }

        const baseCount = Math.min(100, Math.floor(window.innerWidth / 12));
        for (let i = 0; i < baseCount; i++) {
            particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 160;
                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * 0.06;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(196, 248, 42, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function drawMesh() {
            ctx.strokeStyle = 'rgba(196, 248, 42, 0.012)';
            ctx.lineWidth = 0.5;
            const cols = Math.floor(w / 80) + 1;
            const rows = Math.floor(h / 80) + 1;
            const offset = (Date.now() * 0.01) % 80;
            for (let i = 0; i <= cols; i++) {
                ctx.beginPath();
                for (let j = 0; j <= rows; j++) {
                    const x = i * 80;
                    const y = j * 80 + Math.sin((i + Date.now() * 0.0005) * 0.5) * 5;
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ===== ADVANCED CURSOR =====
    const cursorRing = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursorDot');
    const cursorTrail = document.createElement('div');
    cursorTrail.className = 'cursor-trail';
    document.body.appendChild(cursorTrail);

    let mx = 0, my = 0;
    let cx = 0, cy = 0;
    let tx = 0, ty = 0; // trail positions
    let isHovering = false;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    if (cursorRing) {
        function animateCursor() {
            const ease = 0.12;
            const trailEase = 0.08;
            cx += (mx - cx) * ease;
            cy += (my - cy) * ease;
            tx += (mx - tx) * trailEase;
            ty += (my - ty) * trailEase;

            cursorRing.style.left = cx + 'px';
            cursorRing.style.top = cy + 'px';
            if (cursorDot) {
                cursorDot.style.left = mx + 'px';
                cursorDot.style.top = my + 'px';
            }
            cursorTrail.style.left = tx + 'px';
            cursorTrail.style.top = ty + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        cursorRing.addEventListener('mousedown', () => {
            cursorRing.classList.add('click');
            setTimeout(() => cursorRing.classList.remove('click'), 200);
        });
    }

    // Hover effects
    const hoverEls = document.querySelectorAll('a, button, .work-item, .service-row, .insight-card, .client-item, .tech-item, .pillar, .testimonial-card, .social-btn, .award-badge');
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursorRing) cursorRing.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            if (cursorRing) {
                cursorRing.classList.remove('hover');
                cursorRing.classList.remove('view');
            }
        });
    });

    // Magnetic effect
    document.querySelectorAll('.btn, .nav-cta, .social-btn, .pillar').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    // ===== NAVIGATION =====
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (nav) {
            nav.classList.toggle('scrolled', scrollY > 80);
        }
        lastScroll = scrollY;
    }, { passive: true });

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollY = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = target.offsetTop - 80;
                window.scrollTo({ top: offset, behavior: 'smooth' });
                const mobileNav = document.getElementById('mobileNav');
                const burger = document.getElementById('navBurger');
                if (mobileNav) mobileNav.classList.remove('open');
                if (burger) burger.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Mobile menu
    const burger = document.getElementById('navBurger');
    const mobileNav = document.getElementById('mobileNav');

    if (burger && mobileNav) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            mobileNav.classList.toggle('open');
            document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
        });

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== SCROLL REVEAL =====
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
    const serviceRows = document.querySelectorAll('.service-row');
    const workItems = document.querySelectorAll('.work-item');
    const insightCards = document.querySelectorAll('.insight-card');
    const techItems = document.querySelectorAll('.tech-item');
    const pillars = document.querySelectorAll('.pillar');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));

    // Staggered reveal for service rows
    const serviceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const parent = entry.target.closest('.services-list');
                if (parent) {
                    const rows = parent.querySelectorAll('.service-row');
                    rows.forEach((row, i) => {
                        setTimeout(() => {
                            row.style.opacity = '1';
                            row.style.transform = 'translateY(0)';
                        }, i * 80);
                    });
                }
                serviceObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    serviceRows.forEach(row => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(30px)';
        row.style.transition = 'opacity 0.7s var(--ease), transform 0.7s var(--ease)';
        serviceObserver.observe(row);
    });

    // Staggered work items
    const workObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const grid = entry.target;
                const items = grid.querySelectorAll('.work-item');
                items.forEach((item, i) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0) scale(1)';
                    }, i * 80);
                });
                workObserver.unobserve(grid);
            }
        });
    }, { threshold: 0.05 });

    workItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(40px) scale(0.97)';
        item.style.transition = 'opacity 0.8s var(--ease), transform 0.8s var(--ease)';
    });
    const workGrid = document.querySelector('.work-grid');
    if (workGrid) workObserver.observe(workGrid);

    // Staggered insight cards
    const insightObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                insightCards.forEach((card, i) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, i * 100);
                });
                insightObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    insightCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        card.style.transition = 'opacity 0.8s var(--ease), transform 0.8s var(--ease)';
    });
    const insightsGrid = document.querySelector('.insights-grid');
    if (insightsGrid) insightObserver.observe(insightsGrid);

    // Staggered tech items
    const techObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                techItems.forEach((item, i) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, i * 60);
                });
                techObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    techItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s var(--ease), transform 0.6s var(--ease)';
    });
    const techGrid = document.querySelector('.tech-grid');
    if (techGrid) techObserver.observe(techGrid);

    // Staggered pillars
    const pillarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                pillars.forEach((p, i) => {
                    setTimeout(() => {
                        p.style.opacity = '1';
                        p.style.transform = 'translateY(0)';
                    }, i * 100);
                });
                pillarObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    pillars.forEach(p => {
        p.style.opacity = '0';
        p.style.transform = 'translateY(30px)';
        p.style.transition = 'opacity 0.7s var(--ease), transform 0.7s var(--ease)';
    });
    const pillarsContainer = document.querySelector('.about-pillars');
    if (pillarsContainer) pillarObserver.observe(pillarsContainer);

    // ===== COUNTER ANIMATION =====
    const counters = document.querySelectorAll('.metric-num');
    let countersDone = false;

    function animateCounters() {
        if (countersDone) return;
        const heroMetrics = document.querySelector('.hero-metrics');
        if (!heroMetrics) return;
        const rect = heroMetrics.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            countersDone = true;
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                const duration = 2500;
                const start = performance.now();

                function tick(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 5);
                    counter.textContent = Math.floor(ease * target);
                    if (progress < 1) requestAnimationFrame(tick);
                    else {
                        counter.textContent = target;
                        // Pop effect
                        counter.style.transform = 'scale(1.2)';
                        setTimeout(() => {
                            counter.style.transform = 'scale(1)';
                        }, 150);
                    }
                }
                requestAnimationFrame(tick);
            });
        }
    }

    window.addEventListener('scroll', animateCounters, { passive: true });
    animateCounters();

    // ===== PARALLAX ON SCROLL =====
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // Parallax orbs
                document.querySelectorAll('.hero-orb').forEach((orb, i) => {
                    const speed = 0.15 + i * 0.05;
                    orb.style.transform = `translateY(${scrollY * speed}px)`;
                });

                // Parallax grid
                const grid = document.querySelector('.hero-bg-grid');
                if (grid) {
                    grid.style.transform = `translateY(${scrollY * 0.1}px)`;
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // ===== TESTIMONIALS SLIDER =====
    const track = document.getElementById('testimonialsTrack');
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');

    if (track && dotsContainer) {
        const cards = track.querySelectorAll('.testimonial-card');
        let current = 0;
        const total = cards.length;
        let autoplay;

        // Initial card states
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px) scale(0.95)';
            card.style.transition = 'opacity 0.7s var(--ease), transform 0.7s var(--ease)';
        });

        function buildDots() {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            }
        }

        function goTo(index) {
            current = index;
            if (current < 0) current = total - 1;
            if (current >= total) current = 0;

            const isMobile = window.innerWidth <= 900;
            const cardWidth = isMobile ? window.innerWidth - 64 : cards[0].offsetWidth + 24;
            track.style.transform = `translateX(-${current * cardWidth}px)`;

            dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });

            // Animate visible cards
            cards.forEach((card, i) => {
                if (i === current) {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 100);
                }
            });
        }

        function startAutoplay() {
            autoplay = setInterval(() => goTo(current + 1), 5000);
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

        function resetAutoplay() {
            clearInterval(autoplay);
            startAutoplay();
        }

        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goTo(current + 1);
                else goTo(current - 1);
                resetAutoplay();
            }
        }, { passive: true });

        // Observe testimonials section
        const testimonialsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cards.forEach((card, i) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, i * 100);
                    });
                    startAutoplay();
                    testimonialsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const testimonialsSection = document.querySelector('.testimonials');
        if (testimonialsSection) {
            testimonialsObserver.observe(testimonialsSection);
        }

        buildDots();
        goTo(0);
        window.addEventListener('resize', () => goTo(current));
    }

    // ===== MARQUEE PAUSE ON HOVER =====
    const marquee = document.querySelector('.clients-track');
    if (marquee) {
        marquee.addEventListener('mouseenter', () => {
            marquee.style.animationPlayState = 'paused';
        });
        marquee.addEventListener('mouseleave', () => {
            marquee.style.animationPlayState = 'running';
        });
    }

    // ===== CONTACT FORM =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn_submit');
            const originalText = btn.querySelector('.btn-text').textContent;
            btn.querySelector('.btn-text').textContent = 'Sending...';
            btn.disabled = true;

            await new Promise(r => setTimeout(r, 2000));

            btn.querySelector('.btn-text').textContent = 'Sent!';
            btn.style.background = 'var(--accent-2)';
            showToast('Message sent! We\'ll be in touch soon.');

            setTimeout(() => {
                btn.querySelector('.btn-text').textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3500);
        });

        // Floating label effect
        contactForm.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }

    // ===== SHOWREEL THUMBNAIL =====
    const showreelCard = document.getElementById('showreelCard');
    if (showreelCard && showreelCard.hasAttribute('data-thumb')) {
        const thumb = showreelCard.getAttribute('data-thumb');
        const img = new Image();
        img.onload = function () {
            showreelCard.style.backgroundImage = `linear-gradient(to bottom, rgba(5,5,7,0.3) 0%, rgba(5,5,7,0.6) 100%), url(${thumb})`;
        };
        img.src = thumb;
    }

    // ===== SHOWREEL YOUTUBE =====
    const showreelYtWrap = document.getElementById('showreelYtWrap');
    const showreelYt = document.getElementById('showreelYt');
    const showreelPlay = document.getElementById('showreelPlay');

    if (showreelPlay && showreelYt && showreelYtWrap) {
        showreelPlay.addEventListener('click', () => {
            const src = showreelYt.getAttribute('data-src');
            if (src) {
                showreelYt.src = src;
            }
            showreelYtWrap.classList.add('active');
            showreelPlay.style.opacity = '0';
            showreelPlay.style.pointerEvents = 'none';
        });

        showreelCard.addEventListener('click', (e) => {
            if (!showreelYtWrap.classList.contains('active') && !e.target.closest('.showreel-play')) {
                const src = showreelYt.getAttribute('data-src');
                if (src) {
                    showreelYt.src = src;
                }
                showreelYtWrap.classList.add('active');
                showreelPlay.style.opacity = '0';
                showreelPlay.style.pointerEvents = 'none';
            }
        });
    }

    // ===== VIMEO THUMBNAIL SYSTEM =====
    // Gets high-res thumbnails from Vimeo oEmbed API with resolution upgrade.

    /**
     * Upgrades Vimeo thumbnail to 1920px resolution.
     * Pattern: ...-d_295x166.webp → ...-d_1920x1080.webp
     */
    function upgradeToHighRes(thumbnailUrl) {
        if (!thumbnailUrl) return null;
        // Handle formats: -d_295x166, _d_295x166, _295x166
        return thumbnailUrl
            .replace(/-d_\d+x\d+(\?.*)?$/i, '-d_1920x1080$1')
            .replace(/_d_\d+x\d+(\?.*)?$/i, '_d_1920x1080$1')
            .replace(/_(\d+)x(\d+)(\?.*)?$/i, '_1920x1080$3');
    }

    /**
     * Loads thumbnails for all portfolio cards.
     */
    async function loadVimeoThumbnails() {
        const items = document.querySelectorAll('.work-item[data-vimeo]');
        console.log(`[Vimeo Thumbnails] Found ${items.length} work items`);

        for (const item of items) {
            const videoId = item.getAttribute('data-vimeo');
            const bg = item.querySelector('.work-item-bg');
            const skeleton = item.querySelector('.work-thumb-skeleton');
            const hoverTitle = item.querySelector('.work-hover-title');

            if (!bg) {
                console.warn(`[Vimeo] Video ${videoId}: No .work-item-bg found`);
                continue;
            }

            // Priority 1: data-thumb attribute (Cloudinary/custom)
            const customThumb = bg.getAttribute('data-thumb');

            if (customThumb) {
                console.log(`[Vimeo] ${videoId}: Using custom data-thumb`);
                const img = new Image();
                img.onload = () => {
                    bg.style.backgroundImage =
                        `linear-gradient(to bottom, transparent 30%, rgba(5,5,7,0.95) 100%), url(${customThumb})`;
                    bg.classList.add('img-loaded');
                    console.log(`[Vimeo] ${videoId}: Custom thumb loaded`);
                };
                img.onerror = () => {
                    console.warn(`[Vimeo] ${videoId}: Custom thumb failed, trying oEmbed`);
                    loadVimeoOEmbedThumbnail(videoId, bg);
                };
                img.src = customThumb;
            } else {
                await loadVimeoOEmbedThumbnail(videoId, bg);
            }

            if (hoverTitle && !hoverTitle.textContent.trim()) {
                const titleFromData = item.getAttribute('data-title');
                if (titleFromData) hoverTitle.textContent = titleFromData;
            }

            if (skeleton) {
                skeleton.classList.add('hidden');
                setTimeout(() => skeleton.remove(), 700);
            }
        }
    }

    /**
     * Loads thumbnail from Vimeo oEmbed API and upgrades to 1920px.
     */
    async function loadVimeoOEmbedThumbnail(videoId, bg) {
        try {
            console.log(`[Vimeo] ${videoId}: Fetching oEmbed...`);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

            const res = await fetch(
                `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`,
                { signal: controller.signal }
            );
            clearTimeout(timeout);

            if (!res.ok) {
                console.error(`[Vimeo] ${videoId}: oEmbed HTTP ${res.status}`);
                return;
            }

            const data = await res.json();
            const thumbUrl = data.thumbnail_url;

            if (!thumbUrl) {
                console.error(`[Vimeo] ${videoId}: No thumbnail_url in response`);
                return;
            }

            console.log(`[Vimeo] ${videoId}: Got thumbnail: ${thumbUrl.substring(0, 60)}...`);

            // Upgrade to 1920px
            const highResUrl = upgradeToHighRes(thumbUrl);
            console.log(`[Vimeo] ${videoId}: Upgraded to: ${highResUrl.substring(0, 60)}...`);

            // Pre-load to verify it exists
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Important for CORS
            img.onload = () => {
                bg.style.backgroundImage =
                    `linear-gradient(to bottom, transparent 30%, rgba(5,5,7,0.95) 100%), url(${highResUrl})`;
                bg.classList.add('img-loaded');
                console.log(`[Vimeo] ${videoId}: ✅ High-res thumbnail loaded (1920px)`);
            };
            img.onerror = (e) => {
                console.warn(`[Vimeo] ${videoId}: High-res failed, trying original`);
                // Fallback to original oEmbed URL
                const fallbackImg = new Image();
                fallbackImg.crossOrigin = 'anonymous';
                fallbackImg.onload = () => {
                    bg.style.backgroundImage =
                        `linear-gradient(to bottom, transparent 30%, rgba(5,5,7,0.95) 100%), url(${thumbUrl})`;
                    bg.classList.add('img-loaded');
                    console.log(`[Vimeo] ${videoId}: ✅ Original thumbnail loaded`);
                };
                fallbackImg.onerror = () => {
                    console.error(`[Vimeo] ${videoId}: ❌ All thumbnails failed`);
                    bg.style.backgroundImage =
                        'linear-gradient(to bottom, transparent 30%, rgba(5,5,7,0.95) 100%), none';
                };
                fallbackImg.src = thumbUrl;
            };
            img.src = highResUrl;
        } catch (err) {
            console.error(`[Vimeo] ${videoId}: ❌ Error - ${err.message}`);
            bg.style.backgroundImage =
                'linear-gradient(to bottom, transparent 30%, rgba(5,5,7,0.95) 100%), none';
        }
    }

    loadVimeoThumbnails();

    // ===== WORK ITEM HOVER — cinematic overlay reveal =====
    workItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (cursorRing) cursorRing.classList.add('view');
        });
        item.addEventListener('mouseleave', () => {
            if (cursorRing) {
                cursorRing.classList.remove('view');
            }
        });
    });

    // ===== VIDEO MODAL =====
    const videoModal = document.getElementById('videoModal');
    const videoEmbed = document.getElementById('videoEmbed');
    const vmCat = document.getElementById('vmCat');
    const vmYear = document.getElementById('vmYear');
    const vmTitle = document.getElementById('vmTitle');
    const vmDesc = document.getElementById('vmDesc');
    const modalClose = document.getElementById('videoModalClose');
    let currentIframe = null;

    function openVideoModal(item) {
        const vimeoId = item.getAttribute('data-vimeo');
        const title = item.getAttribute('data-title');
        const cat = item.getAttribute('data-category');
        const year = item.getAttribute('data-year');
        const desc = item.querySelector('.work-desc')?.textContent || '';

        vmCat.textContent = cat || '';
        vmYear.textContent = year || '';
        vmTitle.textContent = title || '';
        vmDesc.textContent = desc;

        if (currentIframe) {
            currentIframe.remove();
            currentIframe = null;
        }

        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&quality=auto&color=c4fc2a`;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        videoEmbed.appendChild(iframe);
        currentIframe = iframe;

        videoModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        videoModal.classList.remove('is-open');
        document.body.style.overflow = '';
        if (currentIframe) {
            currentIframe.src = '';
            currentIframe = null;
        }
        document.querySelectorAll('.work-item.is-playing').forEach(el => el.classList.remove('is-playing'));
    }

    modalClose.addEventListener('click', closeVideoModal);
    videoModal.querySelector('.video-modal-backdrop').addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('is-open')) {
            closeVideoModal();
        }
    });

    // ===== WORK ITEMS — click to open modal =====
    workItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                e.preventDefault();
                item.classList.add('is-playing');
                openVideoModal(item);
            }
        });
    });

    // ===== TOAST =====
    function showToast(msg) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon">&#10003;</span><span class="toast-msg">${msg}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4500);
    }

    // ===== KEYBOARD =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mobileNav = document.getElementById('mobileNav');
            const burger = document.getElementById('navBurger');
            if (mobileNav && mobileNav.classList.contains('open')) {
                mobileNav.classList.remove('open');
                burger && burger.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
        if (e.key === 'ArrowLeft') {
            const prev = document.getElementById('testimonialPrev');
            if (prev) prev.click();
        }
        if (e.key === 'ArrowRight') {
            const next = document.getElementById('testimonialNext');
            if (next) next.click();
        }
    });

    // ===== SMOOTH SCROLL ARROW =====
    const scrollHint = document.querySelector('.hero-scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', () => {
            const nextSection = document.querySelector('#showreel');
            if (nextSection) {
                window.scrollTo({
                    top: nextSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }

    // ===== WORK ITEM HOVER LABEL =====
    workItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const title = item.querySelector('.work-title');
            if (title && cursorRing) {
                cursorRing.classList.add('view');
            }
        });
    });

    // ===== SMOOTH ANCHOR REVEAL =====
    window.addEventListener('load', () => {
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) {
                setTimeout(() => {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }, 2600);
            }
        }
    });

    // ===== REDUCED MOTION =====
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.scrollBehavior = 'auto';
    }

    // ===== CONSOLE =====
    console.log('%c◆ SPICE VFX STUDIO', 'font-size:22px;font-weight:800;color:#c4f82a;letter-spacing:8px;text-shadow:0 0 20px rgba(196,248,42,0.4);');
    console.log('%cVFX & 3D Animation — District 7, Ho Chi Minh City, Vietnam', 'font-size:12px;color:rgba(240,240,245,0.3);letter-spacing:2px;');

})();
