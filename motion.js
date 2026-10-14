(() => {
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const narrow=matchMedia('(max-width:900px)');
 const coarse=matchMedia('(pointer:coarse)');
 const animations=new Set();const visited=new WeakSet();let observer;
 const header=document.querySelector('.header');
 const hero=document.querySelector('.hero');
 const targets=[...document.querySelectorAll('.section-heading,.service-card,.fact-panel>div,.about figure,.benefit-panel li,.partner-card,.detail-photo,.next-step')];
 function animate(el,frames,options){if(reduce.matches||!el?.animate)return;try{const animation=el.animate(frames,{duration:440,fill:'backwards',easing:'cubic-bezier(.22,.61,.36,1)',...options});animations.add(animation);animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));return animation}catch{/* All content remains visible without animation. */}}
 function arrive(el,index=0){if(visited.has(el)||reduce.matches)return;visited.add(el);animate(el,[{opacity:el.matches('.service-card')||el.querySelector('.button')?1:.9,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:narrow.matches?320:460,delay:Math.min(index*55,165)});}
 function setupReveal(){observer?.disconnect();if(reduce.matches||!('IntersectionObserver' in window))return;observer=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).forEach((entry,index)=>{arrive(entry.target,index);observer.unobserve(entry.target)})},{threshold:.12});targets.forEach(el=>observer.observe(el));}
 function stopAnimations(){animations.forEach(a=>a.cancel());animations.clear();}
 // Intro is one pass per page load; nothing is CSS-hidden while waiting for JS.
 if(hero&&!reduce.matches){[hero.querySelector('.eyebrow'),hero.querySelector('h1'),hero.querySelector('.hero-description'),hero.querySelector('.hero-actions')].forEach((el,index)=>animate(el,[{opacity:el?.classList.contains('hero-actions')?1:.8,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:500,delay:index*70}));hero.querySelectorAll('.trust-row .icon,.cycle-badge>.icon').forEach((el,index)=>animate(el,[{transform:'translateY(5px)',opacity:.85},{transform:'none',opacity:1}],{duration:550,delay:260+index*55}));}
 setupReveal();
 // Observe the forest only while it is in view; one short move, no perpetual loop.
 const forest=document.querySelector('.forest-photo');let forestObserver;
 if(forest&&'IntersectionObserver' in window){forestObserver=new IntersectionObserver(entries=>{const entry=entries[0];if(entry.isIntersecting&&!reduce.matches&&!narrow.matches&&!coarse.matches&&!visited.has(forest)){visited.add(forest);animate(forest,[{transform:'none'},{transform:'scale(1.02) translateY(3px)',offset:.55},{transform:'none'}],{duration:2400});}},{threshold:.2});forestObserver.observe(forest.parentElement);}
 let scrollFrame=0;function headerState(){header?.classList.toggle('is-scrolled',scrollY>18);scrollFrame=0;}addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(headerState)},{passive:true});headerState();
 // Optional real-video enhancement: blank config is the approved static fallback.
 const config=window.HV_HERO_VIDEO;let video,control,videoObserver,ready=false,inView=false,userPaused=false;
 const saveData=navigator.connection?.saveData;
 function eligible(){return hero&&config?.enabled&&config.sources?.length&&!reduce.matches&&!narrow.matches&&!saveData;}
 function reconcileVideo(){if(!video)return;if(!eligible()||document.hidden||!inView||userPaused){video.pause();video.classList.remove('is-playing');return;}video.play().catch(()=>{video.classList.remove('is-playing');control.hidden=true;hero.dataset.heroMode='static-poster'});}
 if(eligible()){video=document.createElement('video');video.className='hero-video';video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');video.tabIndex=-1;video.poster='assets/hero-1280.webp';for(const source of config.sources){if(!/^assets\/[\w./-]+\.(webm|mp4)$/.test(source.src))continue;const node=document.createElement('source');node.src=source.src;node.type=source.type;video.append(node)}hero.querySelector('.hero-photo').after(video);control=document.createElement('button');control.type='button';control.className='video-control';control.textContent='Animation pausieren';control.hidden=true;control.addEventListener('click',()=>{userPaused=!userPaused;control.textContent=userPaused?'Animation abspielen':'Animation pausieren';reconcileVideo()});hero.append(control);video.addEventListener('playing',()=>{ready=true;hero.dataset.heroMode='real-video';video.classList.add('is-playing');control.hidden=false});video.addEventListener('error',()=>{ready=false;video.classList.remove('is-playing');control.hidden=true;hero.dataset.heroMode='static-poster'});video.querySelectorAll('source').forEach(s=>s.addEventListener('error',()=>{if(video.networkState===3){control.hidden=true;hero.dataset.heroMode='static-poster'}}));videoObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView&&eligible()&&!ready)video.load();reconcileVideo()},{threshold:.05});videoObserver.observe(hero);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAnimations();reconcileVideo()});reduce.addEventListener('change',()=>{stopAnimations();setupReveal();reconcileVideo()});narrow.addEventListener('change',reconcileVideo);
})();


