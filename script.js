/* NETWORK BACKGROUND */

(function(){
  const canvas=document.getElementById("network");
  if(!canvas) return;
  const ctx=canvas.getContext("2d");
  let W,H,nodes=[];
  const MAX_DIST=130;
  const mouse={x:null,y:null};

  function resize(){
    W=canvas.width=window.innerWidth;
    H=canvas.height=document.getElementById("hero").offsetHeight;
  }

  class Node{
    constructor(){
      this.x=Math.random()*W;
      this.y=Math.random()*H;
      this.vx=(Math.random()-0.5)*0.5;
      this.vy=(Math.random()-0.5)*0.5;
    }
    update(){
      this.x+=this.vx;
      this.y+=this.vy;
      if(this.x<0||this.x>W) this.vx*=-1;
      if(this.y<0||this.y>H) this.vy*=-1;

      if(mouse.x){
        const dx=mouse.x-this.x;
        const dy=mouse.y-this.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<180){
          this.vx+=dx*0.0004;
          this.vy+=dy*0.0004;
        }
      }
    }
    draw(){
      ctx.beginPath();
      ctx.arc(this.x,this.y,1.7,0,Math.PI*2);
      ctx.fillStyle="rgba(96,165,250,0.8)";
      ctx.fill();
    }
  }

  function init(){
    nodes=[];
    for(let i=0;i<80;i++) nodes.push(new Node());
  }

  function connect(){
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const dx=nodes[i].x-nodes[j].x;
        const dy=nodes[i].y-nodes[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<MAX_DIST){
          ctx.strokeStyle=`rgba(59,130,246,${1-dist/MAX_DIST})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x,nodes[i].y);
          ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate(){
    ctx.clearRect(0,0,W,H);
    nodes.forEach(n=>{n.update();n.draw();});
    connect();
    requestAnimationFrame(animate);
  }

  document.getElementById("hero").addEventListener("mousemove",e=>{
    const rect=canvas.getBoundingClientRect();
    mouse.x=e.clientX-rect.left;
    mouse.y=e.clientY-rect.top;
  });

  window.addEventListener("resize",()=>{resize();init();});
  resize();init();animate();
})();

/* SCROLL PROGRESS */
const progress=document.getElementById("progress");
window.addEventListener("scroll",()=>{
  const total=document.body.scrollHeight-window.innerHeight;
  progress.style.width=(window.scrollY/total)*100+"%";
});

/* COUNTER */
document.querySelectorAll(".num").forEach(el=>{
  if(el.classList.contains("static")) return;
  const target=+el.dataset.target;
  let count=0;
  const interval=setInterval(()=>{
    count++;
    el.textContent=count+"+";
    if(count>=target) clearInterval(interval);
  },50);
});

/* CONTACT FORM (EmailJS ready) */
emailjs.init("YOUR_PUBLIC_KEY");

document.getElementById("contact-form").addEventListener("submit",function(e){
  e.preventDefault();
  emailjs.send("YOUR_SERVICE_ID","YOUR_TEMPLATE_ID",{
    from_name:document.getElementById("name").value,
    from_email:document.getElementById("email").value,
    subject:document.getElementById("subject").value,
    message:document.getElementById("message").value
  }).then(()=>{
    document.getElementById("toast").classList.add("show");
    setTimeout(()=>document.getElementById("toast").classList.remove("show"),3000);
    this.reset();
  });
});
