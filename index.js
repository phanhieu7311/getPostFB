require('dotenv').config();

const puppeteer=require('puppeteer');

const fetch = require("node-fetch");
const {
  convertCookieFacebook,
  findSubString
} =require('./helper/cookies');
const removeUndefined=require('./middlewares/object.middleware');

cookie=process.env.COOKIE;
agent='Chrome';
idPost='1168781876651613'//'3060445683971373'//'3071413992874542'//'690114134830551'//'2560861030864909' //id post
  

//-------------------------------------GET POST----------------------

//get author
let getAuthor=async(page)=>{
  //try for page
  try{
    let data=await page.evaluate(()=>{
      let pageName=document.querySelector("span[class='fwb fcg']>a").innerText;
      return pageName;
    })
    return data;
  }
  //catch if author is user
  catch{
    let data=await page.evaluate(()=>{
      let pageName=document.querySelector("span[class='fwb']>a").innerText;
      return pageName;
    })
    return data;
  }
}

//get post time
let getPostTime=async(page)=>{
  let data=await page.evaluate(()=>{
    let postTime=document.querySelector("span[class='timestampContent']").innerText;
    return postTime;
  })
  return data;
}

//get post content
let getPostContent=async(page)=>{
  //try for page
  try{
    let data=await page.evaluate(()=>{
      let content=document.querySelector("div[class='permalinkPost'] div[class='_5pbx userContent _3576']").innerText;
      return content;
    })
    return data;
  }
  catch{
    //try for user
    try{
      let data=await page.evaluate(()=>{
        let content=document.querySelector("div[class='_5pbx userContent _3576']").innerText;
        return content;
      })
      return data;
    }
    //catch if post doesn't have content
    catch{
      return null;
    }
  }
}

//get likes
let getLikes=async(page)=>{
  //try for page
  try{
    let data=await page.evaluate(()=>{
      let likes=document.querySelector("div[class='permalinkPost'] span[class='_81hb']").innerText;
      return likes;
    })
    return data;
  }
  catch {
    //try for user
    try{
      let data=await page.evaluate(()=>{
        let likes=document.querySelector("span[class='_81hb']").innerText;
        return likes;
      })
      return data;
    }
    //catch if post has 0 like
    catch{
      return 0;
    }
  }
}

//get shares
let getShares=async(page)=>{
  //try for page
  try{
    let data=await page.evaluate(()=>{
      let shares=document.querySelector("div[class='permalinkPost'] a[class='_3rwx _42ft']").innerText;
      return shares;
    })
    return data;
  } 
  catch{
    //try for user
    try{
      let data=await page.evaluate(()=>{
        let shares=document.querySelector("a[class='_3rwx _42ft']").innerText;
        return shares;
      })
      return data; 
    }
    //catch if post has 0 share
    catch{
      return 0;
    }
  }
}

//get comments
let getComments=async(page)=>{
  //if author is page
  if(await page.$("div[class='permalinkPost']")!=null){
    //Click more comments and reply
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
    await page.waitFor(1000);
    //Get comments and reply
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
      return comment;
    })
    return data;
  }
  //if author is user
  else{
    let moreComments=async()=>{
      try{
        if(await page.$("a[class='_4sxc _42ft']")!=null){
          await page.waitForSelector("a[class='_4sxc _42ft']");
          await page.click("a[class='_4sxc _42ft']");
          await moreComments();
        }
      }catch(err){
        if(await page.$("a[class='_4sxc _42ft']")!=null){
          await page.waitForSelector("a[class='_4sxc _42ft']");
          await page.click("a[class='_4sxc _42ft']");
          await moreComments();
        }
      }
      if(await page.$("a[class='_4sxc _42ft']")!=null){
        await moreComments()
      }
    }
    await moreComments();
    await page.waitFor(1000);
    //Get comments and reply
    let data=await page.evaluate(()=>{
      let comment=[];
      let i=1;
      
        while(document.querySelector("ul[class='_7791']>li:nth-child("+i+")")!=null){
          let cmtText;
          let cmtVideo;
          let cmtImage;
          let cmtSticker;
          let reply=[];
          let cmtUser=document.querySelector("ul[class='_7791']>li:nth-child("+i+") div[class='_72vr']>a").innerText;
          if(document.querySelector("ul[class='_7791']>li:nth-child("+i+") video[class='_ox1']")!=null){
            cmtVideo=document.querySelector("ul[class='_7791']>li:nth-child("+i+") video[class='_ox1']").attributes["src"].value;
          }
          if(document.querySelector("ul[class='_7791']>li:nth-child("+i+") span[class='_3l3x']")!=null){
            cmtText=document.querySelector("ul[class='_7791']>li:nth-child("+i+") span[class='_3l3x']").innerText;
          }
          if(document.querySelector("ul[class='_7791']>li:nth-child("+i+") div[class='_6cuy']>div>div").attributes["style"]!=null){
            cmtStickerString=document.querySelector("ul[class='_7791']>li:nth-child("+i+") div[class='_6cuy']>div>div").attributes["style"].value.split('"');
            cmtSticker=cmtStickerString[1];
          }
          if(document.querySelector("ul[class='_7791']>li:nth-child("+i+") img[class='img']")!=null){
            cmtImage=document.querySelector("ul[class='_7791']>li:nth-child("+i+") img[class='img']").attributes["src"].value;
          }
    
          //get reply
          if(document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul")!=null){
            let j=1;
            while(document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+")")!=null){
              let replyText;
              let replyVideo;
              let replyImage
              let replySticker;
              let replyUser=document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") div[class='_72vr']>a").innerText;
              if(document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") video[class='_ox1']")!=null){
                replyVideo=document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") video[class='_ox1']").attributes["src"].value;
              }
              if(document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") span[class='_3l3x']")!=null){
                replyText=document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") span[class='_3l3x']").innerText;
              }
              if(document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") div[class='_6cuy']>div>div").attributes["style"]!=null){
                replyStickerString=document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") div[class='_6cuy']>div>div").attributes["style"].value.split('"');
                replySticker=replyStickerString[1];
              }
              if(document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") img[class='img']")!=null){
                replyImage=document.querySelector("ul[class='_7791']>li:nth-child("+i+")>div:nth-child(2)>ul>li:nth-child("+j+") img[class='img']").attributes["src"].value;
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
}

//get images
let getImages=async(page)=>{
  let images=[];
  //Images count
  let imagesCount=await page.evaluate(()=>{
    let imgCount;
    //count image if author is page
    if(document.querySelector("div[class='permalinkPost']")!=null){
      if(document.querySelector("div[class='permalinkPost'] div[class='_52db']")!=null){
        imgCount=3+parseInt(document.querySelector("div[class='permalinkPost'] div[class='_52db']").innerText);
      }
      else if(document.querySelector("div[class='permalinkPost'] div[class='_2a2q _65sr']")==null){
        imgCount=1;
      }
      else{
        imgCount=document.querySelector("div[class='permalinkPost'] div[class='_2a2q _65sr']").childElementCount;
      }
    }
    //count image if author is user
    else{
      if(document.querySelector("div[class='_52db']")!=null){
        imgCount=3+parseInt(document.querySelector("div[class='_52db']").innerText);
      }
      else if(document.querySelector("div[class='_2a2q _65sr']")==null){
        imgCount=1;
      }
      else{
        imgCount=document.querySelector("div[class='_2a2q _65sr']").childElementCount;
      }
    }
    return imgCount;
  })
  //Click image
  if(await page.$("div[class='mtm'] a")!=null){
    await page.click("div[class='mtm'] a");
  }
  await page.waitFor( 3000 );
  //Get image src
  for(i=1;i<=imagesCount;i++){
    await page.waitFor( 200 );
    let image=await page.evaluate(async()=>{
      let img=await document.querySelector("img[class='spotlight']").attributes["src"].value;
      return img;
    })
    images.push(image);
    if(imagesCount!=1){
      await page.keyboard.press('ArrowRight');
      if(await page.$("snowliftPager next hilightPager")!=null){
        await page.click("snowliftPager next hilightPager']");
      }
    }
    
  }
  return images;
}


//--------------------------------POST PROPERTIES------------------------------------
//get post 
let getPost= async({author,postTime,content,likes,shares,comment,images},cookie,idPost)=>{
  const cookieConverted = await convertCookieFacebook( cookie )
  let url="https://www.facebook.com/"+idPost;
  const browser=await puppeteer.launch({ headless: false });
  const page=await browser.newPage();
  await page.setCookie( ...cookieConverted );
  await page.waitFor( 1000 );
  await page.goto(url);

  //Close popup image
  if(await page.$("div[class='_n3'] a")!=null){
    await page.click("div[class='_n3'] a");
  }
  if(author==true){
    author=await getAuthor(page);
  }
  if(postTime==true){
    postTime=await getPostTime(page);
  }
  if(content==true){
    content=await getPostContent(page);
  }
  if(likes==true){
    likes=await getLikes(page);
  }
  if(shares==true){
    shares=await getShares(page);
  }
  if(comment==true){
    comment=await getComments(page);
  }
  if(images==true){
    images=await getImages(page);
  }
  return {
    author,
    postTime,
    content,
    likes,
    shares,
    comment,
    images
  };
}

let crawl=async({author,postTime,content,likes,shares,comment,images},cookie,idPost)=>{
  let data=await getPost({author,postTime,content,likes,shares,comment,images},cookie,idPost);
  console.log(removeUndefined(data))
}
crawl({author:true,content:true},cookie,idPost);