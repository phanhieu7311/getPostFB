require('dotenv').config();

const puppeteer=require('puppeteer');

const fetch = require("node-fetch");
const {
  convertCookieFacebook,
  findSubString
} =require('./helper/cookies');

access_token = process.env.FB_ACCESS_TOKEN;
cookie=process.env.COOKIE;
agent='Chrome';
id = '881821441833819' //id page
idPost='3060445683971373'//'2560861030864909'//'690114134830551' //id post
  

//-------------------------------------puppeteer----------------------

//get page name
let getPageName=async(page)=>{
  let data=await page.evaluate(()=>{
    let pageName=document.querySelector("span[class='fwb fcg']>a").innerText;
    return pageName;
  })
  return data;
}

//get post time
let getPostTime=async(page)=>{
  let data=await page.evaluate(()=>{
    let postTime=document.querySelector("div[class='permalinkPost'] span[class='timestampContent']").innerText;
    return postTime;
  })
  return data;
}

//get post content
let getPostContent=async(page)=>{
  let data=await page.evaluate(()=>{
    if(document.querySelector("div[class='permalinkPost'] div[class='_5pbx userContent _3576']")!=null){
      let content=document.querySelector("div[class='permalinkPost'] div[class='_5pbx userContent _3576']").innerText;
      return content;
    }
    return null;
  })
  return data;
}

//get likes
let getLikes=async(page)=>{
  let data=await page.evaluate(()=>{
    if(document.querySelector("div[class='permalinkPost'] span[class='_81hb']")!=null){
      let likes=document.querySelector("div[class='permalinkPost'] span[class='_81hb']").innerText;
      return likes;
    }
    return null;
  })
  return data;
}

//get shares
let getShares=async(page)=>{
  let data=await page.evaluate(()=>{
    if(document.querySelector("div[class='permalinkPost'] a[class='_3rwx _42ft']")!=null){
      let shares=document.querySelector("div[class='permalinkPost'] a[class='_3rwx _42ft']").innerText;
      return shares;
    }
    return null;
  })
  return data; 
}

//get comments
let getComments=async(page)=>{

  let moreComments=async()=>{
    try{
      if(await page.$("div[class='permalinkPost'] a[class='_4sxc _42ft']")!=null){
        await page.waitForSelector("div[class='permalinkPost'] a[class='_4sxc _42ft']");
        await page.click("div[class='permalinkPost'] a[class='_4sxc _42ft']");
        await moreComments();
      }
    }catch(err){
      if(await page.$("div[class='permalinkPost'] a[class='_4sxc _42ft']")!=null){
        await page.waitForSelector("div[class='permalinkPost'] a[class='_4sxc _42ft']");
        await page.click("div[class='permalinkPost'] a[class='_4sxc _42ft']");
        await moreComments();
      }
    }
    if(await page.$("div[class='permalinkPost'] a[class='_4sxc _42ft']")!=null){
      await moreComments()
    }
  }
  
  await moreComments();

  let data=await page.evaluate(()=>{
    let comment=[];
    let i=1;
    while(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")")!=null){
      let cmtText;
      let cmtVideo;
      let cmtImage;
      let cmtSticker;
      let reply=[];
      let cmtUser=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+") div[class='_72vr']>a").innerText;
      if(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+") video[class='_ox1']")!=null){
        cmtVideo=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+") video[class='_ox1']").attributes["src"].value;
      }
      if(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+") span[class='_3l3x']")!=null){
        cmtText=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+") span[class='_3l3x']").innerText;
      }
      if(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+") div[class='_6cuy']>div>div").attributes["style"]!=null){
        cmtStickerString=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+") div[class='_6cuy']>div>div").attributes["style"].value.split('"');
        cmtSticker=cmtStickerString[1];
      }
      if(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+") img[class='img']")!=null){
        cmtImage=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+") img[class='img']").attributes["src"].value;
      }

      //get reply
      if(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul")!=null){
        let j=1;
        while(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+")")!=null){
          let replyText;
          let replyVideo;
          let replyImage
          let replySticker;
          let replyUser=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") div[class='_72vr']>a").innerText;
          if(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") video[class='_ox1']")!=null){
            replyVideo=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") video[class='_ox1']").attributes["src"].value;
          }
          if(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") span[class='_3l3x']")!=null){
            replyText=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") span[class='_3l3x']").innerText;
          }
          if(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") div[class='_6cuy']>div>div").attributes["style"]!=null){
            replyStickerString=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") div[class='_6cuy']>div>div").attributes["style"].value.split('"');
            replySticker=replyStickerString[1];
          }
          if(document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") img[class='img']")!=null){
            cmtImage=document.querySelector("div[class='permalinkPost'] ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") img[class='img']").attributes["src"].value;
          }
          j++;
          reply.push({
            replyUser,
            replyText,
            replyVideo,
            replyImage,
            replySticker
          })
        }
      }

      i++;
      comment.push({
        cmtUser,
        cmtText,
        cmtVideo,
        cmtImage,
        cmtSticker,
        reply
      })
    }
    return comment
  })
  return data;
}

//get images
let getImages=async(page)=>{
  let images=[];
  let imagesCount=await page.evaluate(()=>{
    let imgCount;
    if(document.querySelector("div[class='permalinkPost'] div[class='_52db']")!=null){
      imgCount=3+parseInt(document.querySelector("div[class='permalinkPost'] div[class='_52db']").innerText);
    }
    else if(document.querySelector("div[class='permalinkPost'] div[class='_2a2q _65sr']")==null){
      imgCount=1;
    }
    else{
      imgCount=document.querySelector("div[class='permalinkPost'] div[class='_2a2q _65sr']").childElementCount;
    }
    return imgCount;
  })
  if(await page.$("div[class='mtm'] a")!=null){
    await page.click("div[class='mtm'] a");
  }
  await page.waitFor( 1000 );
  
  for(i=1;i<=imagesCount;i++){
    if(imagesCount!=1){
      await page.keyboard.press('ArrowRight');
      if(await page.$("snowliftPager next hilightPager")!=null){
        await page.click("snowliftPager next hilightPager']");
      }
    }
    await page.waitFor( 200 );
    let image=await page.evaluate(async()=>{
      let img=await document.querySelector("img[class='spotlight']").attributes["src"].value;
      return img;
    })
    images.push(image);
  }
  return images;
}

//get post 
let pupp= async(cookie,idPost)=>{
  const cookieConverted = await convertCookieFacebook( cookie )
  let url="https://www.facebook.com/"+idPost;
  const browser=await puppeteer.launch({ headless: false });
  const page=await browser.newPage();
  await page.setCookie( ...cookieConverted );
  await page.waitFor( 1000 );
  await page.goto(url);

  if(await page.$("div[class='_n3'] a")!=null){
    await page.click("div[class='_n3'] a");
  }

  let pageName=await getPageName(page);
  let postTime=await getPostTime(page);
  let content=await getPostContent(page);
  let likes=await getLikes(page);
  let shares=await getShares(page);
  let comment=await getComments(page);
  let images=await getImages(page);
  
  return {
    pageName,
    postTime,
    content,
    likes,
    shares,
    comment,
    images
  };
}

let crawl=async(cookie,idPost)=>{
  let data=await pupp(cookie,idPost);
  console.log(data)
}
crawl(cookie,idPost);