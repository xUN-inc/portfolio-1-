function loco() {
    gsap.registerPlugin(ScrollTrigger);
    const locoScroll = new LocomotiveScroll({
        el: document.querySelector("#main"),
        smooth: true,
        lerp: 0.05
    });

    // Scroll-to-Top Button
    const toTop = document.querySelector('#foot-to-top > img');
    toTop.addEventListener('click', () => {
        locoScroll.scrollTo(0);
    });

    // Section Navigation
    const toAbout = document.querySelector('#to-about');
    toAbout.addEventListener('click', () => {
        locoScroll.scrollTo(window.innerHeight);
    });
    const toEducation = document.querySelector('#to-education');
    toEducation.addEventListener('click', () => {
        locoScroll.scrollTo(window.innerHeight * 2);
    });
    const toSkills = document.querySelector('#to-skills');
    toSkills.addEventListener('click', () => {
        locoScroll.scrollTo(window.innerHeight * 3);
    });
    const toProjects = document.querySelector('#to-projects');
    toProjects.addEventListener('click', () => {
        locoScroll.scrollTo(window.innerHeight * 6.3);
    });

    // Sync LocomotiveScroll with ScrollTrigger
    locoScroll.on("scroll", ScrollTrigger.update);
    ScrollTrigger.scrollerProxy("#main", {
        scrollTop(value) {
            return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
    });

    // Prevent auto-scrolling to top at the end of the page
    locoScroll.on("call", (func) => {
        if (func === "end") {
            // Ensure no unintended scroll-to-top behavior occurs
            locoScroll.stop();
        }
    });

    // Ensure LocomotiveScroll and ScrollTrigger refresh properly
    ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    ScrollTrigger.refresh();
}
loco();

function cursorAnimation() {
    var main = document.querySelector("#main");
    var cursor = document.querySelector("#cursor");
    document.addEventListener("mousemove", (dets) => {
        gsap.to(cursor, {
            x: dets.x,
            y: dets.y,
            duration: 0.8,
            easing: "easeInOut",
            mixBlendMode: "difference"
        });
    });
    main.addEventListener("mouseenter", () => {
        gsap.to(cursor, {
            scale: 1,
            opacity: 1
        });
    });
    main.addEventListener("mouseleave", () => {
        gsap.to(cursor, {
            scale: 0,
            opacity: 0
        });
    });
}
cursorAnimation();

var tl_1 = gsap.timeline();

tl_1.to("#loader>h1", {
    opacity: 0,
    duration: 0.5,
    delay: 2.5
});

tl_1.to(".loader-sleeve:nth-child(2n)", {
    x: "-100%",
    duration: 0.8,
    borderRadius: "10vmax",
    stagger: 0.1
});

tl_1.to(".loader-sleeve:nth-child(2n-1)", {
    x: "100%",
    duration: 0.8,
    borderRadius: "10vmax",
    stagger: 0.1,
    delay: -1.15
});

tl_1.from("#nav-left h1", {
    x: -200,
    opacity: 0,
    delay: 0.5,
    duration: 0.6
});
tl_1.from("#nav-center a", {
    y: -100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    delay: -0.5
});
tl_1.from("#nav-right button", {
    x: 200,
    opacity: 0,
    duration: 0.6,
    delay: -0.4
});
tl_1.from("#go-down", {
    y: -20,
    repeat: -1,
    yoyo: true,
    ease: "bounce.out"
});

var typed = new Typed('#typed', {
    strings: ['Full Stack Developer', 'Web Designer', 'Database Engineer', 'Graphic Designer', 'DSA Enthusiast'],
    typeSpeed: 20,
    backSpeed: 40,
    smartBackspace: true,
    backDelay: 1500,
    loop: true
});

var tl_2 = gsap.timeline();
tl_2.from("#about-header p, #about-header h1", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: "#about-header h1",
        scroller: "#main",
        // markers:true,
        start: "top 70%",
        end: "top 55%",
        scrub: 2
    }
});
tl_2.from("#about-img img", {
    x: -200,
    opacity: 0,
    rotate: -45,
    scrollTrigger: {
        trigger: "#about-img img",
        scroller: "#main",
        // markers:true,
        start: "top 60%",
        end: "top 45%",
        scrub: 2
    }
});
tl_2.from("#about-card", {
    opacity: 0,
    scale: 0,
    scrollTrigger: {
        trigger: "#about-card",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_2.to("#go-down", {
    opacity: 0,
    display: "none",
    scrollTrigger: {
        trigger: "#about-header h1",
        scroller: "#main",
        scrub: true,
        // markers:true,
        start: "top 100%",
        end: "top 80%"
    }
});

var tl_3 = gsap.timeline();
tl_3.from("#education-header p, #education-header h1", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: "#education-header h1",
        scroller: "#main",
        // markers:true,
        start: "top 85%",
        end: "top 65%",
        scrub: 2
    }
});
tl_3.from("#edu-images img", {
    y: -200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: "#edu-images",
        scroller: "#main",
        // markers:true,
        start: "top 70%",
        end: "top 50%",
        scrub: 2
    }
});
tl_3.from(".edu-v-line", {
    x: -1000,
    opacity: 0,
    stagger: 0.3,
    scrollTrigger: {
        trigger: ".edu-v-line",
        scroller: "#main",
        // markers:true,
        start: "top 80%",
        end: "top 70%",
        scrub: 2
    }
})
tl_3.from(".education h3, .education p", {
    y: 200,
    opacity: 0,
    stagger: 0.1,
    scrollTrigger: {
        trigger: "#edu-descriptions",
        scroller: "#main",
        // markers:true,
        start: "top 90%",
        end: "top 80%",
        scrub: 2
    }
});

var tl_4 = gsap.timeline();
tl_4.from("#technical-skill-header p, #technical-skill-header h1", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: "#technical-skill-header h1",
        scroller: "#main",
        // markers:true,
        start: "top 85%",
        end: "top 65%",
        scrub: 2
    }
});
tl_4.to(".html", {
    width: "95%",
    scrollTrigger: {
        trigger: ".html",
        scroller: "#main",
        // markers:true,
        start: "top 90%",
        end: "top 70%",
        scrub: 2
    }
});
tl_4.to(".cpp", {
    width: "70%",
    scrollTrigger: {
        trigger: ".cpp",
        scroller: "#main",
        // markers:true,
        start: "top 90%",
        end: "top 70%",
        scrub: 2
    }
});
tl_4.to(".java", {
    width: "90%",
    scrollTrigger: {
        trigger: ".java",
        scroller: "#main",
        // markers:true,
        start: "top 90%",
        end: "top 70%",
        scrub: 2
    }
});
tl_4.to(".py", {
    width: "80%",
    scrollTrigger: {
        trigger: ".py",
        scroller: "#main",
        // markers:true,
        start: "top 90%",
        end: "top 70%",
        scrub: 2
    }
});
tl_4.to(".php", {
    width: "65%",
    scrollTrigger: {
        trigger: ".php",
        scroller: "#main",
        // markers:true,
        start: "top 90%",
        end: "top 70%",
        scrub: 2
    }
});

var tl_4 = gsap.timeline();
tl_4.from("#technical-skill-header p, #technical-skill-header h1", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: "#technical-skill-header h1",
        scroller: "#main",
        // markers:true,
        start: "top 90%",
        end: "top 75%",
        scrub: 2
    }
});


var tl_5 = gsap.timeline();
tl_5.from("#non-technical-skill-header p, #non-technical-skill-header h1", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: "#non-technical-skill-header h1",
        scroller: "#main",
        // markers:true,
        start: "top 85%",
        end: "top 65%",
        scrub: 2
    }
});
tl_5.to(".lead", {
    backgroundImage: "conic-gradient(#00ff15 345deg, #000000 0 235deg, #000000 0)",
    scrollTrigger: {
        trigger: ".lead",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 70%",
        scrub: 2
    }
});
tl_5.to(".pers", {
    backgroundImage: "conic-gradient(#00ff15 310deg, #000000 0 235deg, #000000 0)",
    scrollTrigger: {
        trigger: ".pers",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 70%",
        scrub: 2
    }
});
tl_5.to(".resi", {
    backgroundImage: "conic-gradient(#00ff15 320deg, #000000 0 235deg, #000000 0)",
    scrollTrigger: {
        trigger: ".resi",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 70%",
        scrub: 2
    }
});
tl_5.to(".hard", {
    backgroundImage: "conic-gradient(#00ff15 290deg, #000000 0 235deg, #000000 0)",
    scrollTrigger: {
        trigger: ".hard",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 70%",
        scrub: 2
    }
});
tl_5.to(".crtv", {
    backgroundImage: "conic-gradient(#00ff15 350deg, #000000 0 235deg, #000000 0)",
    scrollTrigger: {
        trigger: ".crtv",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 70%",
        scrub: 2
    }
});
tl_5.to(".invt", {
    backgroundImage: "conic-gradient(#00ff15 340deg, #000000 0 235deg, #000000 0)",
    scrollTrigger: {
        trigger: ".invt",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 70%",
        scrub: 2
    }
});

var tl_6 = gsap.timeline();
tl_6.from("#project-header p, #project-header h1", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: "#project-header h1",
        scroller: "#main",
        // markers:true,
        start: "top 85%",
        end: "top 65%",
        scrub: 2
    }
});
tl_6.from(".apple>.project-cover", {
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".apple>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".apple>.project-name>h1, .apple>.project-name>p", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".apple>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".magma>.project-cover", {
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".magma>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".magma>.project-name>h1, .magma>.project-name>p", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".magma>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".vendr>.project-cover", {
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".vendr>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".vendr>.project-name>h1, .vendr>.project-name>p", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".vendr>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".blinkchat>.project-cover", {
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".blinkchat>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".blinkchat>.project-name>h1, .blinkchat>.project-name>p", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".blinkchat>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".scribblehub>.project-cover", {
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".scribblehub>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".scribblehub>.project-name>h1, .scribblehub>.project-name>p", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".scribblehub>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".voxel>.project-cover", {
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".voxel>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".voxel>.project-name>h1, .voxel>.project-name>p", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".voxel>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".wordle>.project-cover", {
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".wordle>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".wordle>.project-name>h1, .wordle>.project-name>p", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".wordle>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".newsmonkey>.project-cover", {
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".newsmonkey>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".newsmonkey>.project-name>h1, .newsmonkey>.project-name>p", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".newsmonkey>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".savorly>.project-cover", {
    scale: 0,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".savorly>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from(".savorly>.project-name>h1, .savorly>.project-name>p", {
    y: 200,
    opacity: 0,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".savorly>.project-name>h1",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});
tl_6.from("#more-projects p", {
    x: -300,
    opacity: 0,
    scrollTrigger: {
        trigger: "#more-projects p",
        scroller: "#main",
        // markers:true,
        start: "top 95%",
        end: "top 80%",
        scrub: 2
    }
});

const navLinks = document.querySelectorAll("#nav-center a");
navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
        gsap.to(link, {
            color: "#b0b0b0"
        });
    });
});
navLinks.forEach((link) => {
    link.addEventListener("mouseleave", () => {
        gsap.to(link, {
            color: "#fff"
        });
    });
});

const contactButton = document.querySelector("#nav-right button");
contactButton.addEventListener("mouseenter", () => {
    gsap.to(contactButton, {
        backgroundColor: "#d1d1d1"
    });
});
contactButton.addEventListener("mouseleave", () => {
    gsap.to(contactButton, {
        backgroundColor: "#fff"
    });
});

const aboutImage = document.querySelector("#about-img img");
aboutImage.addEventListener("mouseenter", () => {
    gsap.to(aboutImage, {
        scale: 1.1,
        opacity: 1,
        boxShadow: "0px 0px 50px rgba(255, 255, 255, 0.5)"
    });
});
aboutImage.addEventListener("mouseleave", () => {
    gsap.to(aboutImage, {
        scale: 1,
        opacity: 0.8,
        boxShadow: "0px 0px 0px transparent"
    });
});

const aboutCard = document.querySelector("#about-card");
aboutCard.addEventListener("mouseenter", () => {
    gsap.to(aboutCard, {
        backgroundColor: "rgba(255, 255, 255, 0.150)"
    });
});
aboutCard.addEventListener("mouseleave", () => {
    gsap.to(aboutCard, {
        backgroundColor: "rgba(255, 255, 255, 0.110)"
    });
});

const educationImages = document.querySelectorAll("#edu-images img");
educationImages.forEach((image) => {
    image.addEventListener("mouseenter", () => {
        gsap.to(image, {
            scale: 1.1
        });
    });
});
educationImages.forEach((image) => {
    image.addEventListener("mouseleave", () => {
        gsap.to(image, {
            scale: 1
        });
    });
});

const skillImages = document.querySelectorAll(".tech-skill-logo img");
skillImages.forEach((image) => {
    image.addEventListener("mouseenter", () => {
        gsap.to(image, {
            scale: 1.1
        });
    });
});
skillImages.forEach((image) => {
    image.addEventListener("mouseleave", () => {
        gsap.to(image, {
            scale: 1
        });
    });
});

const skillPies = document.querySelectorAll(".pie");
skillPies.forEach((pie) => {
    pie.addEventListener("mouseenter", () => {
        gsap.to(pie, {
            scale: 1.1
        });
    });
});
skillPies.forEach((pie) => {
    pie.addEventListener("mouseleave", () => {
        gsap.to(pie, {
            scale: 1
        });
    });
});

const projectImages = document.querySelectorAll(".project-cover a img");
projectImages.forEach((image) => {
    image.addEventListener("mouseenter", () => {
        gsap.to(image, {
            scale: 1.1
        });
    });
});
projectImages.forEach((image) => {
    image.addEventListener("mouseleave", () => {
        gsap.to(image, {
            scale: 1
        });
    });
});

const gitLogo = document.querySelector("#more-projects>p>a>i");
gitLogo.addEventListener("mouseenter", () => {
    gsap.to(gitLogo, {
        color: "#b0b0b0"
    });
});
gitLogo.addEventListener("mouseleave", () => {
    gsap.to(gitLogo, {
        color: "#fff"
    });
});
const skills = [
    { name: 'HTML', color: '#E44D26', imgPath: './images/skills/skill-html.png' },
    { name: 'CSS', color: '#264DE4', imgPath: './images/skills/skill-css.png' },
    { name: 'JavaScript', color: '#F7DF1E', imgPath: './images/skills/skill-js.png' },
    { name: 'Python', color: '#3776AB', imgPath: './images/skills/skill-python.png' },
    { name: 'Java', color: '#007396', imgPath: './images/skills/skill-java.webp' },
    { name: 'PostgreSQL', color: '#336791', imgPath: './images/skills/skill-post.png' },
    { name: 'MySQL', color: '#4479A1', imgPath: './images/skills/skill-mysql.png' },
    { name: 'Git', color: '#F05032', imgPath: './images/skills/skill-git.png' },
    { name: 'Tailwind', color: '#38B2AC', imgPath: './images/skills/skill-tail.png' },
    { name: 'React', color: '#61DAFB', imgPath: './images/skills/skill-react.png' },
    { name: 'Spring Boot', color: '#6DB33F', imgPath: 'images/spring-boot.png' },
    { name: 'Django', color: '#092E20', imgPath: './images/skills/skill-dj.jpg' },
    { name: 'TypeScript', color: '#3178C6', imgPath: './images/skills/skill-ts.png' },
    { name: 'Next.js', color: '#000000', imgPath: './images/skills/skill-next.webp' },
    { name: 'Express.js', color: '#000000', imgPath: './images/skills/skill-exp.png' },
    { name: 'Figma', color: '#F24E1E', imgPath: './images/skills/skill-figma.png' },
    { name: 'MongoDB', color: '#47A248', imgPath: './images/skills/skill-mongo.png' },
    { name: 'Firebase', color: '#FFCA28', imgPath: './images/skills/firebase.png' },
    { name: 'Azure', color: '#0089D6', imgPath: './images/skills/azure.png' },
    { name: 'NumPy', color: '#013243', imgPath: './images/skills/NumPy.png' },
    { name: 'Pandas', color: '#150458', imgPath: './images/skills/Pandas.png' },
    { name: 'TensorFlow', color: '#FF6F00', imgPath: './images/skills/TensorFlow.png' },
    { name: 'Electron', color: '#47848F', imgPath: './images/skills/Electron.png' },
    { name: 'Node.js', color: '#339933', imgPath: './images/skills/skil-node.png' },
    { name: 'Docker', color: '#2496ED', imgPath: './images/skills/Docker.png' },
    { name: 'Postman', color: '#FF6C37', imgPath: './images/skills/Postman.png' },
    { name: 'ASP.NET', color: '#512BD4', imgPath: './images/skills/NETcore.png' },
    { name: 'Kubernetes', color: '#326CE5', imgPath: './images/skills/Kubernetes.png' },
    { name: 'Jenkins', color: '#FFCA28', imgPath: './images/skills/Jenkins.png' },
    { name: 'Selenium', color: '#F05032', imgPath: './images/skills/Selenium.png' }
];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const labelsContainer = document.getElementById('labels-container');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Preload images
const loadedImages = {};
skills.forEach(skill => {
    const img = new Image();
    img.src = skill.imgPath;
    loadedImages[skill.name] = img;
});

class Bubble {
    constructor(skill) {
        this.skill = skill;
        this.radius = Math.random() * 20 + 35;
        this.x = Math.random() * (width - this.radius * 2) + this.radius;
        this.y = Math.random() * (height - this.radius * 2) + this.radius;
        this.dx = (Math.random() - 0.5) * 2;
        this.dy = (Math.random() - 0.5) * 2;
        this.originalRadius = this.radius;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
    }

    draw() {
        // Draw bubble background
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.skill.color + '20';
        ctx.fill();
        ctx.strokeStyle = this.skill.color + '60';
        ctx.stroke();

        // Clip the drawing area to the bubble
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.clip();

        // Draw icon
        const img = loadedImages[this.skill.name];
        if (img.complete && img.naturalHeight !== 0) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            const iconSize = this.radius * 1.2;
            ctx.drawImage(img, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
            ctx.rotate(-this.rotation * Math.PI / 180);
            ctx.translate(-this.x, -this.y);
        }

        ctx.restore();
    }

    update() {
        if (this.x + this.radius > width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.x += this.dx;
        this.y += this.dy;
        this.rotation += this.rotationSpeed;

        this.draw();
    }
}

let bubbles = skills.map(skill => new Bubble(skill));

function animate() {
    ctx.clearRect(0, 0, width, height);
    bubbles.forEach(bubble => bubble.update());
    requestAnimationFrame(animate);
}

// Event Listener for resizing
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    bubbles = skills.map(skill => new Bubble(skill));
});

// Start animation
animate();

// Function to check the user's country based on IP
fetch('https://ipinfo.io?token=a3cf2d8d2cf935')  // Your API key is now used here
    .then(response => response.json())
    .then(data => {
        const country = data.country;

        // Check if the country is India (IN)
        if (country === 'IN') {
            // Redirect to a restricted page if the user is from India
            window.location.href = 'https://www.linkedin.com/in/akshunchauhan/';
        }
    })
    .catch(error => {
        console.error('Error fetching IP info:', error);
    });

