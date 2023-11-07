const scorePlate = document.querySelector(".scorePlate h3");
const audio = document.querySelector(".music");
const canvas = document.querySelector(".canvas");
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player  {
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw(){
        c.save();
        c.translate(this.x - 100, this.y - 100); 
        const img = new Image();
        img.src = "images/player2.png";
        c.drawImage(img, 0, 0, 150, 150);
        c.restore();
    }
}

class Projectile  {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.save(); // Save the current transformation state
        c.translate(this.x - this.radius, this.y - this.radius); 
        c.rotate(2.4 + Math.atan2(this.velocity.y, this.velocity.x));
        const img = new Image();
        img.src = "images/arrow.png";
        c.drawImage(img, 0, 0, 100, 100);
        c.restore(); // Restore the previous transformation state
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy  {
    constructor(x, y, radius, color, planetNumber, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.planetNumber = planetNumber;
        this.velocity = velocity;
        this.hitCount = 0;
    }
    draw() {
        let planets = [
            "images/planet.png",
            "images/planet2.png",
            "images/planet3.png",
            "images/planet4.png",
            "images/spacecrapt.png",
            "images/meteor.png",
        ]
        c.save();
        c.translate(this.x + this.velocity.x, this.y + this.velocity.y); 
        c.rotate(2.4 + Math.atan2(this.velocity.y, this.velocity.x));
        const img = new Image();
        img.src = planets[Math.floor(this.planetNumber)];
        c.drawImage(img, -this.radius, -this.radius, this.radius + this.radius, this.radius + this.radius);
        c.restore();
        // c.beginPath();
        // c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        // c.fillStyle = this.color;
        // c.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Particle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }
}

const player = new Player(window.innerWidth - 70, window.innerHeight - 70, 40, "green")
player.draw()

let projectiles = [];
let enemies = [];
let particles = [];
let totalScore = 0;

let time = 2000;

function createEnemies() {
    setInterval(() => {
        let x;
        let y;
        let control = Math.random() * 10;
        let planetSize = Math.random() * 80 + 20;
        let planetNumber = Math.random() * 6;

        if(control >= 5) {
            x = Math.random() * window.innerWidth - 100;
            y = Math.random() * 0;
        }else {
            x = Math.random() * 0;
            y = Math.random() * window.innerHeight - 80;
        }
        const angle = Math.atan2(window.innerHeight - y, window.innerWidth - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        }
        enemies.push(new Enemy(x, y, planetSize, "transparent", planetNumber, velocity))
    }, time -= 100)
}

let animationId;
function animate(){
    animationId = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()

    projectiles.forEach((projectile) => {
        projectile.update()
    })

    enemies.forEach((enemy) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            setTimeout(() => {
                audio.pause()
            }, 100)
        }

        let enemiesToRemove = []; // Create an array to store enemies to remove
        projectiles.forEach((projectile, projectileIndex) => {
            enemies.forEach((enemy, enemyIndex) => {
                const dist = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);
                if (dist - (enemy.radius - 20) - projectile.radius < 1) {
                    if(enemy.radius >= 80) {
                        let radious80 = totalScore < 500 ? 4 : 9 ;
                        if (enemy.hitCount >= radious80) {
                            enemiesToRemove.push(enemyIndex);
                            totalScore += 50;
                        }else {
                            enemy.hitCount += 1;
                        }
                    }else if(enemy.radius >= 50) {
                        let radious50 = totalScore < 500 ? 1 : 3 ;
                        if (enemy.hitCount >= radious50) {
                            enemiesToRemove.push(enemyIndex);
                            totalScore += 20;
                        }else {
                            enemy.hitCount += 1;
                        }
                    }else {
                        enemiesToRemove.push(enemyIndex);
                        totalScore += 10;
                    }
                    projectiles.splice(projectileIndex, 1);
                }
            });
        });

        // Inside your animate function, after removing the enemy, add particle effects
        enemiesToRemove.sort((a, b) => b - a);
        enemiesToRemove.forEach((index) => {
            const removedEnemy = enemies[index];
            enemies.splice(index, 1);

            // Create and animate particles at the enemy's position
            for (let i = 0; i < Math.ceil(removedEnemy.radius); i++) {
                const particle = new Particle(removedEnemy.x, removedEnemy.y, 3, "gray");
                particles.push(particle);

                // Animate the particle's opacity using GSAP
                gsap.to(particle, {
                    duration: 0.9,
                    x: particle.x + (Math.random() - 0.6) * (100 + removedEnemy.radius),
                    y: particle.y + (Math.random() - 0.6) * (100 + removedEnemy.radius),
                    opacity: 0,
                    onComplete: () => {
                        // Remove the particle when the animation is done
                        particles.splice(particles.indexOf(particle), 1);
                    },
                    onUpdate: () => {
                        // Redraw the particle during the animation
                        particle.draw();
                    },
                });
            }
        });
        scorePlate.innerHTML = totalScore;
    })
}

window.addEventListener("click", (e) => {
    const angle = Math.atan2(e.clientY - (window.innerHeight - 70), e.clientX - (window.innerWidth - 70));
    const velocity = {
        x: Math.cos(angle) * 15,
        y: Math.sin(angle) * 15,
    }
    projectiles.push(new Projectile((window.innerWidth - 70), (window.innerHeight - 70), 20, "red", velocity))
    audio.play()
})

animate()
createEnemies()
