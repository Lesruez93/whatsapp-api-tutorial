const { Client, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
let { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fs = require('fs');
const { phoneNumberFormatter } = require('./helpers/formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');
const rp = require('request-promise-native');

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: true
}));

const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  session: sessionCfg
});

async function send_message(data) {
  console.log(data)
  const num = phoneNumberFormatter(data.to_number);

 await client.sendMessage(num, data.message).then(response => {
    console.log(response)
  }).catch(err => {
    console.log(err)
  });


}



async function sendMedia(data) {
  const num = phoneNumberFormatter(data.to_number);
  let mimetype;
  const attachment = await axios.get(data.message, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  client.sendMessage(num, media, {
    caption: 'file'
  }).then(response => {

  }).catch(err => {
    console.log(err)

  })
}

  client.on('message', msg => {
    let today = new Date();
    let curHr = today.getHours();
    let time;
    let body = {};
    let bodyText = {};
    if (curHr < 12) {
      time = 'this morning';
    } else if (curHr < 18) {
      time = 'this afternoon';
    } else {
      time = 'this evening';
    }



    getUser(msg.from.replace(/@.*$/,"")).then((res) => {

      if (res.fields.name && !res.fields.age) {
        // gender not submited

        patchUserAge(msg.from.replace(/@.*$/,""), msg.body).then((resp) => {

          body = {
            message: 'Its  a pleasure to meet you ' + res.fields.name.stringValue + '  , how may I be of help to you today? \n ' +
                '  \n   ' +
                '*Please select any of the options below* \n ' +
                ' \n' +
                '   1.	Entrepreneurship and business   \n' +
                '   2.	Leadership and group strengthening   \n' +
                '   3.	Getting myself ready for work  \n' +
                '   4.	Access to finance  \n' +
                '   5.	Opportunities for the young people  \n' +
                '   6.	Useful contacts in case of emergency  \n' +
                '   7.	Important notifications',
            type: 'text'
          };
          body.to_number = msg.from;
          send_message(body);

        }).catch((error) => {
        })
      }
      else if (res.fields.id && res.fields.name === undefined) {
        console.log(res);
        //name not submitedd


        patchUsername(msg.from.replace(/@.*$/,""), msg.body).then((res) => {
          body = {
            message: 'Nice to meet you  , just of interest sake how old are you  and what is your gender\n' +
                'eg type: *24  female* ', type: 'text'
          };

          body.to_number = msg.from;
          send_message(body);
        }).catch((error) => {
        })

      }
      else if(!res.fields.id && !res.fields.name && !res.fields.age){
        postUser(msg.from.replace(/@.*$/,"")).then((res) => {

          body = {
            message: 'Hello Hi, I am Shamwari a Youth Alliance for Safer Cities youth helper and adviser. I will be pleased to know who I am talking to.',
            type: 'text'
          };
          body.to_number = msg.from;
          send_message(body);

        }).catch((error) => {
        })
      }

      else {
        console.log('lllll',msg.body.toLowerCase())

        switch (msg.body.toLowerCase()) {


          case 'hie':

            body = {
              message: 'Welcome back ' + res.fields.name.stringValue + '  , how may I be of help to you ' + time + '\n ' +
                  '  \n   ' +
                  '*Please select any of the options below* \n ' +
                  ' \n' +
                  '   1.	Entrepreneurship and business   \n' +
                  '   2.	Leadership and group strengthening   \n' +
                  '   3.	Getting myself ready for work  \n' +
                  '   4.	Access to finance  \n' +
                  '   5.	Opportunities for the young people  \n' +
                  '   6.	Useful contacts in case of emergency  \n' +
                  '   7.	Important notifications',
              type: 'text'
            };
            body.to_number = msg.from;

            //	 send_message(bodyText);
            send_message(body);

            break;
          case 'menu':

            body = {
              message: 'Welcome back ' + res.fields.name.stringValue + '  , how may I be of help to you ' + time + '\n ' +
                  '  \n   ' +
                  '*Please select any of the options below* \n ' +
                  ' \n' +
                  '   1.	Entrepreneurship and business   \n' +
                  '   2.	Leadership and group strengthening   \n' +
                  '   3.	Getting myself ready for work  \n' +
                  '   4.	Access to finance  \n' +
                  '   5.	Opportunities for the young people  \n' +
                  '   6.	Useful contacts in case of emergency  \n' +
                  '   7.	Important notifications',
              type: 'text'
            };
            body.to_number = msg.from;

            //	 send_message(bodyText);
            send_message(body);

            break;
          case 'hi':

            body = {
              message: 'Welcome back ' + res.fields.name.stringValue + '  , how may I be of help to you ' + time + '\n ' +
                  '  \n   ' +
                  '*Please select any of the options below* \n ' +
                  ' \n' +
                  '   1.	Entrepreneurship and business   \n' +
                  '   2.	Leadership and group strengthening   \n' +
                  '   3.	Getting myself ready for work  \n' +
                  '   4.	Access to finance  \n' +
                  '   5.	Opportunities for the young people  \n' +
                  '   6.	Useful contacts in case of emergency  \n' +
                  '   7.	Important notifications',
              type: 'text'
            };
            body.to_number = msg.from;

            //	 send_message(bodyText);
            send_message(body);

            break;
          case '1':
            body = {
              type: 'text',
              message: 'Type: *1A*  for Lesson 1: introduction to entrepreneurship \n' +
                  ' Type: *1B*  for Lesson 2. Idea generation\n' +
                  ' Type: *1C*  for Lesson 3. Business plan writing [part 1]\n' +
                  ' Type: *1D*  for Lesson 4. Business plan writing [part 2]\n' +
                  ' Type: *1E*  for Lesson 5. Business plan writing [part3]\n' +
                  ' Type: *1F*  for Lesson 6. Record keeping in business\n' +
                  ' Type: *1G*  for Lesson 7. Book keeping in business\n' +
                  ' Type: *1A2*  for Expanding my business venture\n',
            };
            body.to_number = msg.from;
            //	 send_message(bodyText);
            send_message(body);
            break;

          case  '1a':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/intro%2FINTRODUCTION%20TO%20ENTREPRENUERSHIP-lesson%201.pdf?alt=media&token=aa73320a-76a4-4d8c-9212-7189aedfd006'
            };
            bodyText = {
              type: 'text',
              message: '*Lesson 1: introduction to entrepreneurship* \n' +
                  '\n' +
                  'Entrepreneurship refers to the process of creating a new enterprise and bearing any of its risks, with the\n' +
                  'view of making a profit.\n' +
                  'Case Study-01\n' +
                  'Chipo is a 22 year young woman who lives in Epworth. In her community refuse is rarely collected and\n' +
                  'this poses high risk of her community to be health hazard. She implements her idea of refuse collection\n' +
                  'services in her community charging $2 per household per month for waste collection services rendered\n' +
                  'once every week' +

                  ' Type: *1B* for next lesson' +
                  '\n⬇️*Download this PDF for more*',
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText)
            sendMedia(body);

            break;

          case  '1b':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/intro%2FINTRODUCTION%20TO%20ENTERPRENUERSHIP-lesson%202.pdf?alt=media&token=4c9cf3e2-0503-44c4-b0d9-7e94d86ec153'
            };
           bodyText = {
              type: 'text',
              message: '*Lesson 2  Idea generation* \n ' +

                  '\n' +
                  'From the previous lesson we were introduced to Chipo’s refuse collection business in Epworth. But I\n' +
                  'know you may be asking how did she do it, how did she think of that idea among a thousand other\n' +
                  'questions which we may be having from that case study. In this lesson we will be learning of ideation in\n' +
                  'simple terms the art of generating a business idea.'
                  +
                  'Type: *1C* for next lesson' +
                  '\n⬇️*Download this PDF for more*',
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);



            break;

          case  '1c':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/intro%2FINTRODUCTION%20TO%20ENTERPRENUERSHIP-lesson%203.pdf?alt=media&token=a5d9174c-e707-40be-bff8-dc281c2c8183'
            };
             bodyText = {
              type: 'text',
              message: '*Lesson 3 Business plan writing [part 1]* ' +

                  '\n' +
                  'DEVELOPING A BUSINESS PLAN [PART 1]\n' +
                  'Now that you have an idea it’s good to develop a plan around that idea we call it a business plan. This\n' +
                  'business plan will outline the general planning needed to start and run a successful business from the\n' +
                  'idea you came up with. A business plan is a very important strategic tool for entrepreneurs. A good\n' +
                  'business plan not only helps you as an entrepreneur to focus on the specific steps necessary for you to\n' +
                  'make your business idea succeed, but it will also help you to achieve both your short-term and long term objectives. If you fail to plan, you are planning to fail and as an entrepreneur you want to minimize\n' +
                  'chances of failure because of time and resources you invest in your business.\n'
                  +
                  ' \n Type: *1D* for next lesson' +
                  '\n⬇️*Download this PDF for more*',
            };

            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case  '1d':
            bodyText = {
              type: 'text',
              message: '*Lesson 4  Business plan writing [part 2]* \n' +

                  '\n' +
                  'DEVELOPING A BUSINESS PLAN [PART 2]\n' +
                  'In the previous lesson we have learnt how to do develop an executive summary and opportunity section\n' +
                  'of a business plan. Today we will be discussing about the Execution section of the business plan.\n' +
                  ' Type: *1E* for next lesson \n' +

                  '\n⬇️*Download this PDF for more*',
            };
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/intro%2FINTRODUCTION%20TO%20ENTERPRENUERSHIP-lesson%204.pdf?alt=media&token=66f69df7-1a4b-464f-adbc-3cef6e0528c1'
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case  '1e':
            bodyText = {
              type: 'text',
              message: '*Lesson 5 Business plan writing [part 3]*  \n' +

                  '\n' +
                  'DEVELOPING A BUSINESS PLAN [PART 3]\n' +
                  'Today we are covering the remaining section of our business plan which are: company and management\n' +
                  'summary, financial plan and the appendix sections. \n'

                  +

                  ' Type: *1F* for next lesson \n' +
                  '\n⬇️*Download this PDF for more*',

            };
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/intro%2FINTRODUCTION%20TO%20ENTERPRENUERSHIP-lesson%205.pdf?alt=media&token=19455de1-5987-41e7-b1fc-5fa34eda9474'

            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case  '1f':
            bodyText = {
              type: 'text',
              message: '*Lesson 6 Record keeping in business*  \n' +
                  'RECORD KEEPING\n' +
                  'The term “record keeping” refers to the orderly and disciplined practice of storing business records.\n' +
                  'Record keeping is one of your most important responsibilities as a small business owner. The success of\n' +
                  'your business depends on creating and maintaining an effective record system, whether your business is\n' +
                  'a sole proprietorship, partnership, or corporation.'
                  +
                  ' Type: *1G* for next lesson \n' +

                  '\n⬇️*Download this PDF for more*',
            };
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/intro%2FINTRODUCTION%20TO%20ENTERPRENUERSHIP-lesson%206.pdf?alt=media&token=63746328-71ed-42d0-adf6-4f6e1ecc3b3c'
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case  '1g':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/intro%2FINTRODUCTION%20TO%20ENTERPRENUERSHIP-lesson%207.pdf?alt=media&token=8be1550c-728d-4c48-b24c-0b99046f2b8d'
            };
            bodyText = {
              type: 'text',
              message: '*Lesson 7 Book keeping in business* \n' +
                  'BOOK KEEPING\n' +
                  'Bookkeeping is the process of recording all financial transactions made by a business. Bookkeepers are\n' +
                  'responsible for recording, classifying, and organizing every financial transaction that is made through the\n' +
                  'course of business operations. Bookkeeping differs from accounting. The accounting process uses the\n' +
                  'books kept by the bookkeeper to prepare the end of the year accounting statements and accounts. ' +
                  '\n⬇️' +
                  ' Type: *1A2* for next lesson \n' +

                  '*Download this PDF for more*',

            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

            // Part 2

          case '2':
            body = {
              type: 'text',
              message: '2. *Leadership and group strengthening* ' +
                  '\n' +
                  'Type: *2A*  for:  Group strengthening  \n' +
                  ' Type: *2B*  for: The art of great leadership\n' +
                  ' Type: *2C* for: Documentation\n'

            };
            body.to_number = msg.from;
            send_message(body);
            break;


          case  '1a2':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/addit%2FExpanding%20my%20business.pdf?alt=media&token=74b34a9b-55b0-4882-9878-f7649c3064c1'
            };
            bodyText = {
              type: 'text',
              message: '*Expanding my business venture* \n' +
                  '\n' + 'Grow your business\n' +
                  'Business Growth is a stage where the business reaches the point for expansion and seeks additional\n' +
                  'options to generate more profit. Business growth is a function of the business lifecycle, industry growth\n' +
                  'trends, and the owners’ desire for equity value creation.\n' +
                  ' Type: *2A* for next lesson \n' +
                  '\n⬇️*Download this PDF for more*',
            };

            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);

            break;

          case '2a':
            body = {
              type: 'text',
              message: '1. *Group strengthening*' +
                  '\n' +
                  'Type: *2A1*  for: Lesson 1: Group dynamics  \n' +
                  ' Type: *2A2*  for: Lesson 2: Group structure\n' +
                  ' Type: *2A3*  Lesson 3: Group management\n'

            };

            body.to_number = msg.from;
            send_message(body);

            break;

            /* case 2a*/
          case '2a1':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/group%2FGROUP%20DYNAMICS%2C%20STRUCTURE%20AND%20MANAGEMENT-lesson%201.pdf?alt=media&token=f2e99245-79dd-4af9-a2d7-2c24e70e5a19'
            };
            bodyText = {
              type: 'text',
              message: '*Lesson 1: Group dynamics*  \n ' +
                  'GROUP DYNAMICS [LESSON 1]\n' +
                  'What is a group?\n' +
                  'A group is a collection of two or more persons bound together by common social standards, interests, etc. (as modifier) group behavior. There are various reasons to which people form groups which may, include; music, art, business, school among other reasons. \n' +
                  ' There is no rigid reasons for why people should form group \n' +
                  'Type: *2A2* for next lesson \n' +

                  '\n⬇️*Download this PDF for more*',

            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case '2a2':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/group%2FGROUP%20DYNAMICS%2C%20STRUCTURE%20AND%20MANAGEMENT-lesson%202.pdf?alt=media&token=45e7a415-ce05-4740-b7e0-7dc2c11fae29'
            };
            bodyText = {
              type: 'text',
              message: '*Lesson 2: Group structure*  \n Type: *2A3* for next lesson \n' +
                  '\n' +
                  'GROUP STRUCTURE [LESSON 2]\n' +
                  'Group structure is defined as the layout of a group. It is a combination of group roles, norms,\n' +
                  'conformity, workplace behavior, status, reference groups, status, social loafing, cohorts, group\n' +
                  'demography and cohesiveness.\n' +
                  '\n⬇️*Download this PDF for more*',
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case '2a3':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/group%2FGROUP%20DYNAMICS%2C%20STRUCTURE%20AND%20MANAGEMENT-lesson%203.pdf?alt=media&token=2997b3ca-b1a6-4cf2-b0b3-8f44c9be73f3'
            };
            bodyText = {
              type: 'text',
              message: '*Lesson 3: Group management*  \n Type: *2B* for next lesson \n' +
                  'GROUP MANAGEMENT [LESSON 3]\n' +
                  'A) Group Decision making\n' +
                  'Group decision-making commonly known as collaborative decision-making is a situation faced when\n' +
                  'individuals collectively make a choice from the alternatives before them. The decision is then no longer\n' +
                  'attributable to any individual group member as all the individuals and social group processes like social\n' +
                  'influence contribute to the decision outcome. The decisions made by groups are mostly different from\n' +
                  'those made by individuals.\n' +
                  '\n⬇️*Download this PDF for more*',

            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

            /* case 2b*/

          case '2b':
            body = {
              type: 'text',
              message: '2. *The art of great leadership*' +
                  '\n' +
                  'Type: *2b1*  for: Lesson 1: What is a leader?  \n' +
                  ' Type: *2b2*  for: Lesson 2: Leadership Styles.\n'

            };
            body.to_number = msg.from;
            send_message(body);
            break;

          case '2b1':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/leadership%2FLEADSHIP-lesson%201.pdf?alt=media&token=289b80f0-559a-42e6-a72c-f0012f6a1ff6'
            };
            bodyText = {
              type: 'text',
              message: '*Lesson 1: What is a leader?*\n' +
                  'What is leadership?\n' +
                  'Definitions ' +
                  '\n' +
                  '▪ The process-oriented, non-specific practices of challenging the process, inspiring a\n' +
                  'shared vision, enabling others to act, modeling the way, and encouraging the\n' +
                  'heart.\n' +
                  '▪ It is the art of motivating a group of people to act toward achieving a common\n' +
                  'goal.\n' +
                  '▪ Leadership is a process of social influence, which maximizes the efforts of others,\n' +
                  'towards the achievement of a goal.\n' +
                  '▪ Leadership is the process of influencing others to understand and agree about\n' +
                  'what needs to be done and how to do it, and the process of facilitating individual\n' +
                  'and collective efforts to accomplish shared objective\n' +

                  '  \n Type: *2B2* for next lesson \n' +
                  '\n⬇️*Download this PDF for more*',

            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case '2b2':
            bodyText = {
              type: 'text',
              message: '*Lesson 2: Choosing the right leadership model for your group/team* \n' +
                  'A. Choosing the right leadership models for you group/team\n' +
                  'Let’s get this out of the way this early on: There is NO one correct leadership style. A lot of factors affect\n' +
                  'the kind of leadership model that works for a particular individual, group, team, and / or organization.\n' +
                  'Some leadership models that work with others won’t always work with the next team or group. It’s\n' +
                  'important to remember that leadership, as well as whichever of the leadership models one chooses isn’t\n' +
                  'the end into itself — the goal is to drive a team or the organization forward in a positive way, fostering\n' +
                  'an environment where stakeholders are motivated, productive, and creative, and creating a way for that\n' +
                  'organization to keep its relevance and continue to be innovative, cost-effective, and revenue-generating\n' +
                  'if it’s a business.\n' +
                  ' Type: *3A* for next lesson \n' +
                  '⬇️*Download this PDF for more*',
            };
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/leadership%2FLEADERSHIP-lesson%202.pdf?alt=media&token=96901da3-9c21-49c6-bf81-e45554fb682a'
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;


          case '2c':
            body = {
              type: 'text',
              message: '2. * Documentation*' +
                  '\n' +
                  'Type: *2c1*  for: Lesson 1: Report Writing: Type, Format, Structure and relevance  \n' +
                  ' Type: *2c2*  Lesson 2: Minute taking\n'

            };
            body.to_number = msg.from;
            send_message(body);
            break;

          case '2c1':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/doc%2FDOCUMENTATION-report%20writing%20(lesson%201).pdf?alt=media&token=5cc2b001-418e-4fb3-a306-affd21726533'
            };
            bodyText = {
              type: 'text',
              message: '*Lesson 1: Report Writing: Type, Format, Structure and relevance*\n ' +

                  ' REPORT WRITING: TYPE, FORMAT, STRUCTURE AND RELEVANCE WHAT IS A REPORT \n' +
                  'A report is an informational work made with an intention to relay information or recounting certain events in a presentable manner.' +
                  '\n' +
                  'More Definitions: (verb) give a spoken or written account of something that one has observed, heard, done, or investigated. (noun) an account given of a particular matter, especially in the form of an official document, after thorough investigation or consideration by an appointed person or body Essentially, a report is a short, sharp, concise document which is written for a particular purpose an audience.\n' +
                  ' It generally sets outs and analyses a situation or problem, often making recommendations for future action. It is a factual paper, and needs to be clear and well-structured' +
                  ' \n Type: *2C2* for next lesson \n' +
                  '\n⬇️*Download this PDF for more*'

            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case '2c2':
            bodyText = {
              type: 'text',
              message: '*Lesson 2: Minute taking* \n' +
                  'DOCUMENTATION: WRITING SKILLS' +
                  'How to take useful minutes of a meeting As a minute taker, you are responsible for recording relevant notes during meetings. You should then use these to produce a final document to be sent to attendees and anyone who requires a copy. However, to produce minutes that are useful, you need to know what to prepare in advance. We willexplain how you can record the minutes of a meeting effectively.' +
                  ' Knowing this will help you to produce successful notes in the form of the final minutes document. ⬇️*Download this PDF for more* \n',
            };
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/doc%2FDOCUMENTATION-Minute%20taking%20(lesson%202).pdf?alt=media&token=f81ebe16-f42a-4fa3-b57b-65e04f306995'
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;


            /* case 3*/
          case '3':
            body = {
              type: 'text',
              message: '3. *Getting myself ready for work* ' +
                  '\n' +
                  'Type: *3A*  for:  Lesson 1: Essential skills for Job seekers  \n' +
                  ' Type: *3B*  for: Lesson 2: Getting ready for work\n' +
                  ' Type: *3C*  for  Lesson 3: Communication\n' +
                  ' Type *3D* for Lesson 4 interview skills\n'


            };
            body.to_number = msg.from;
            send_message(body);
            break;

          case '3a':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/getting%2FGETTING%20READY%20FOR%20WORK-lesson%201.pdf?alt=media&token=84b1013e-4a84-4bb1-a9f1-4c3b87cf7e0e'
            };
            bodyText = {
              type: 'text',
              message: '*Lesson 1: Essential skills for Jobseekers* \n' +

                  'ESSENTIAL SKILLS FOR WORK\n' +
                  'A. EMPLOYABILITY SKILLS\n' +
                  'What are Employability Skills?\n' +
                  'Employability skills are the core skills and traits needed in nearly every job. These are the general\n' +
                  'skills that make someone desirable to an organization. Hiring managers almost always look for\n' +
                  'employees with these skills. Employability skills are sometimes called foundational skills or job-readiness\n' +
                  'skills.'
                  +

                  '  \n Type: *3B* for next lesson \n' +
                  '⬇️*Download this PDF for more*',
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case '3b':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/getting%2FGETTING%20READY%20FOR%20WORK-lesson%202.pdf?alt=media&token=f7bf5935-4010-4b81-a8f3-053899b6e9c6'
            };
            bodyText = {
              type: 'text',
              message: '*Lesson 2: Getting ready for work*' +
                  'GETTING READY FOR WORK\n' +
                  '1) Writing my CV\n' +
                  'What is a CV?\n' +
                  'A CV (also known as a Curriculum Vitae, or résumé), is a written overview of your skills, education, and\n' +
                  'work experience.\n' +
                  'They may be used for a variety of reasons, however, the most common of these is to send to prospective\n' +
                  'employers when looking for a new job.\n' +
                  '  \n Type: *3C* for next lesson \n' +
                  +
                      '⬇️*Download this PDF for more*',
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case '3c':
            bodyText = {
              type: 'text',
              message: '*Lesson 3: Communication* \n' +
                  '\n' +
                  'COMMUNICATION\n' +
                  'What is communication?\n' +
                  '▪ It is the act of conveying meanings from one entity or group to another through the use of mutually\n' +
                  'understood signs, symbols, and semiotic rules.\n' +
                  '▪ Communication is a social process in which two or more persons exchange information and share\n' +
                  'meaning. It is a two-way process and takes Place over time rather than instantaneously' +
                  ' Type: *3D* for next lesson \n' +
                  +
                      '⬇️*Download this PDF for more*'
              ,
            };
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/getting%2FGETTING%20READY%20FOR%20WORK-lesson%203.pdf?alt=media&token=0b0bc8ce-4467-4429-ba3e-8067860594b0'
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case '3d':
            bodyText = {
              type: 'text',
              message: '*Lesson 4: Interview Skills* \n' +
                  'INTERVIEW SKILLS\n' +
                  'HOW TO PREPARE FOR A JOB INTERVIEW\n' +
                  'When it comes to an interview, you can never be too prepared…\n' +
                  'Whether you’re new to job hunting, or you’re a well-practiced interviewee – thorough research and\n' +
                  'effective preparation is absolutely essential to guarantee interview success. Attempting to ‘wing it’ will\n' +
                  'only ever end badly (and/or in awkward silences). \n'
                  +
                  ' Type: *4* for next lesson \n' +

                  '⬇️*Download this PDF for more*'
              ,
            };
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/getting%2FGETTING%20READY%20FOR%20WORK-lesson%204.pdf?alt=media&token=86c5b842-472d-4c42-ba5c-6e10aaa206b1'
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText); sendMedia(body);
            break;

          case '4':
            bodyText = {
              type: 'text',
              message: '4. *Access to finance* \n' +

                  'Funding my business venture [lesson 1]\n' +
                  'Access to finance is the ability of individuals or enterprises to obtain financial services,\n' +
                  'including credit, deposit, payment, insurance, and other risk management services. As an\n' +
                  'entrepreneur, finance is needed to start, grow or expand your business venture \n' +
                  '⬇️*Download this PDF for more*'
              ,
            };
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/addit%2FAccess%20to%20finance.pdf?alt=media&token=d64359d5-e95c-4138-aa20-acf375670adf'
            };
            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText).then(() => {
              send_message(body);
            });

            break;
          case '5':
            body = {
              type: 'text',
              message: '5. *Opportunities for the young people* \n' +

                  '\n ' +
                  "Type: *5A* for  Zimbabwe Tourism Authority innovation programme " + '\n' +
                  "Type: *5B* for TEF Entrepreneurship Programme "


            };
            body.to_number = msg.from;
            send_message(body);
            break;


          case '5a':
            body = {
              type: 'text',
              message: '5A. *Zimbabwe Tourism Authority Programme* \n' +

                  "Are you a Zimbabwean innovator or start up?  Zimbabwe Tourism Authority is looking  for sustainable, disruptive and " +
                  "innovative projects for Zimbabwe's tourism sector. The overall best project will receive seed funding and selected projects will" +
                  " take part in a mentorship and incubation programme with industry leaders. Applicants should be 25 years &" +
                  " below. The deadline for project submission is 30 June 2021. To enter visit ZTA website zimbabwetourism.net/innovation or email innovation@ztazim.co.zw"


            };
            body.to_number = msg.from;
            send_message(body);

            break;

          case '5b':
            body = {
              type: 'text',
              message: '5B. *TEF Entrepreneurship Programme* \n' +

                  "The TEF Entrepreneurship Programme is the $100million commitment of Tony O. Elumelu, CON, an African investor and philanthropist, to identify, mentor, and fund 10,000 African entrepreneurs in 10 years, with the goal of creating millions of jobs and revenue on the continent.  With the support of partners, the Programme has scaled its commitment beyond its own commitment of funding 10,000 African entrepreneurs.\n" +
                  "\n" +
                  "\n" +
                  "To apply, log on to the multilingual application portal on www.tefconnect.com to sign up.\n" +
                  "\n" +
                  "Click on “Apply” and fill the form.\n" +
                  "\n" +
                  " Due date is the 31st of March"


            };
            body.to_number = msg.from;
            send_message(body);

            break;

          case '6':
            body = {
              type: 'media',
              message: 'https://firebasestorage.googleapis.com/v0/b/my-pt-zim-fb13e.appspot.com/o/addit%2FUSEFUL%20CONTACTS.pdf?alt=media&token=838c5059-7e0f-47d8-8232-7c75257bc272'
            };

            bodyText = {
              type: 'text',
              message: '*5. Useful contacts in case of emergency* \n' +
                  'USEFUL CONTACTS\n' +
                  'There are useful contacts that one should have at their fingertips. There are some issues that we may\n' +
                  'face and we may not have idea where to turn to. The following highlighted issues has useful contacts\n' +
                  'you may get in touch with pertaining to that issue' +
                  '⬇️*Download this PDF for more*'
              ,
            };

            bodyText.to_number = msg.from;
            body.to_number = msg.from;
            send_message(bodyText).then(() => {
              send_message(body);
            });
            break;
          case '7':
            body = {
              type: 'text',
              message: '5. *Important notifications* \n' +
                  '\n ' +
                  "You will be able to receive important notifications through this bot "


            };
            body.to_number = msg.from;
            send_message(body);
            break;

          default:
            body = {
              message: 'I didn\'t understand what you said. please reply with the keyword *menu* for options',
              type: 'text'
            };
            body.to_number = msg.from;
            send_message(body);
        }


      }

    }).catch((error) => {


    });


    // if (msg.body == 'hi') {
    //
    //
    // } else if (msg.body == 'good morning') {
    //   msg.reply('selamat pagi');
    // } else if (msg.body == '!groups') {
    //   client.getChats().then(chats => {
    //     const groups = chats.filter(chat => chat.isGroup);
    //
    //     if (groups.length == 0) {
    //       msg.reply('You have no group yet.');
    //     } else {
    //       let replyMsg = '*YOUR GROUPS*\n\n';
    //       groups.forEach((group, i) => {
    //         replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
    //       });
    //       replyMsg += '_You can use the group id to send a message to the group._'
    //       msg.reply(replyMsg);
    //     }
    //   });
    // }

    // Downloading media
    // if (msg.hasMedia) {
    //   msg.downloadMedia().then(media => {
    //     // To better understanding
    //     // Please look at the console what data we get
    //     console.log(media);
    //
    //     if (media) {
    //       // The folder to store: change as you want!
    //       // Create if not exists
    //       const mediaPath = './downloaded-media/';
    //
    //       if (!fs.existsSync(mediaPath)) {
    //         fs.mkdirSync(mediaPath);
    //       }
    //
    //       // Get the file extension by mime-type
    //       const extension = mime.extension(media.mimetype);
    //
    //       // Filename: change as you want!
    //       // I will use the time for this example
    //       // Why not use media.filename? Because the value is not certain exists
    //       const filename = new Date().getTime();
    //
    //       const fullFilename = mediaPath + filename + '.' + extension;
    //
    //       // Save to file
    //       try {
    //         fs.writeFileSync(fullFilename, media.data, {encoding: 'base64'});
    //         console.log('File downloaded successfully!', fullFilename);
    //       } catch (err) {
    //         console.log('Failed to save the file:', err);
    //       }
    //     }
    //   });
    // }
  });

  client.initialize();

// Socket IO
  io.on('connection', function (socket) {
    socket.emit('message', 'Connecting...');

    client.on('qr', (qr) => {
      console.log('QR RECEIVED', qr);
      qrcode.toDataURL(qr, (err, url) => {
        socket.emit('qr', url);
        socket.emit('message', 'QR Code received, scan please!');
      });
    });

    client.on('ready', () => {
      socket.emit('ready', 'Whatsapp is ready!');
      socket.emit('message', 'Whatsapp is ready!');
    });

    client.on('authenticated', (session) => {
      socket.emit('authenticated', 'Whatsapp is authenticated!');
      socket.emit('message', 'Whatsapp is authenticated!');
      console.log('AUTHENTICATED', session);
      sessionCfg = session;
      fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
          console.error(err);
        }
      });
    });

    client.on('auth_failure', function (session) {
      socket.emit('message', 'Auth failure, restarting...');
    });

    client.on('disconnected', (reason) => {
      socket.emit('message', 'Whatsapp is disconnected!');
      fs.unlinkSync(SESSION_FILE_PATH, function (err) {
        if (err) return console.log(err);
        console.log('Session file deleted!');
      });
      client.destroy();
      client.initialize();
    });
  });


  const checkRegisteredNumber = async function (number) {
    const isRegistered = await client.isRegisteredUser(number);
    return isRegistered;
  }

// Send message
  app.post('/send-message', [
    body('number').notEmpty(),
    body('message').notEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req).formatWith(({
                                                       msg
                                                     }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped()
      });
    }

    const number = phoneNumberFormatter(req.body.number);
    const message = req.body.message;

    const isRegisteredNumber = await checkRegisteredNumber(number);

    if (!isRegisteredNumber) {
      return res.status(422).json({
        status: false,
        message: 'The number is not registered'
      });
    }

    client.send_message(number, message).then(response => {
      res.status(200).json({
        status: true,
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
  });

// Send media
  app.post('/send-media', async (req, res) => {
    const number = phoneNumberFormatter(req.body.number);
    const caption = req.body.caption;
    const fileUrl = req.body.file;

    // const media = MessageMedia.fromFilePath('./image-example.png');
    // const file = req.files.file;
    // const media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name);
    let mimetype;
    const attachment = await axios.get(fileUrl, {
      responseType: 'arraybuffer'
    }).then(response => {
      mimetype = response.headers['content-type'];
      return response.data.toString('base64');
    });

    const media = new MessageMedia(mimetype, attachment, 'Media');

    client.send_message(number, media, {
      caption: caption
    }).then(response => {
      res.status(200).json({
        status: true,
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
  });

  const findGroupByName = async function (name) {
    const group = await client.getChats().then(chats => {
      return chats.find(chat =>
          chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
      );
    });
    return group;
  }

// Send message to group
// You can use chatID or group name, yea!
  app.post('/send-group-message', [
    body('id').custom((value, {req}) => {
      if (!value && !req.body.name) {
        throw new Error('Invalid value, you can use `id` or `name`');
      }
      return true;
    }),
    body('message').notEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req).formatWith(({
                                                       msg
                                                     }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped()
      });
    }

    let chatId = req.body.id;
    const groupName = req.body.name;
    const message = req.body.message;

    // Find the group by name
    if (!chatId) {
      const group = await findGroupByName(groupName);
      if (!group) {
        return res.status(422).json({
          status: false,
          message: 'No group found with name: ' + groupName
        });
      }
      chatId = group.id._serialized;
    }

    client.send_message(chatId, message).then(response => {
      res.status(200).json({
        status: true,
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
  });


// Clearing message on spesific chat
  app.post('/clear-message', [
    body('number').notEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req).formatWith(({
                                                       msg
                                                     }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped()
      });
    }

    const number = phoneNumberFormatter(req.body.number);

    const isRegisteredNumber = await checkRegisteredNumber(number);

    if (!isRegisteredNumber) {
      return res.status(422).json({
        status: false,
        message: 'The number is not registered'
      });
    }

    const chat = await client.getChatById(number);

    chat.clearMessages().then(status => {
      res.status(200).json({
        status: true,
        response: status
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    })
  });


  async function getUser(id) {
   // const i = phoneNumberFormatter(id);
    let url = 'https://firestore.googleapis.com/v1/projects/my-pt-zim-fb13e/databases/(default)/documents/users/' + id;
    let response = await rp(url, {
      method: 'get',
      json: true,
      headers: {
        'Content-Type': 'application/json',

      },
    });
    return response;
  }

  async function getUsers() {
    let url = 'https://firestore.googleapis.com/v1/projects/my-pt-zim-fb13e/databases/(default)/documents/users?pageSize=5000';
    let response = await rp(url, {
      method: 'get',
      json: true,
      headers: {
        'Content-Type': 'application/json',

      },
    });
    return response;
  }

  async function postUser(id) {
    const i = phoneNumberFormatter(id);

    var body = {
      "fields": {
        "id": {
          "stringValue": id
        }
      }
    };
    let url = 'https://firestore.googleapis.com/v1/projects/my-pt-zim-fb13e/databases/(default)/documents/users/' + id;
    let response = await rp(url, {
      method: 'patch',
      json: true,
      body,
      headers: {
        'Content-Type': 'application/json',

      },
    });
    return response;
  }

  async function patchUserAge(id, age) {
    const i = phoneNumberFormatter(id);

    var body = {
      "fields": {
        "age": {
          "stringValue": age
        }
      }
    };
    let url = 'https://firestore.googleapis.com/v1/projects/my-pt-zim-fb13e/databases/(default)/documents/users/' + id + '?updateMask.fieldPaths=age';
    let response = await rp(url, {
      method: 'patch',
      json: true,
      body,
      headers: {
        'Content-Type': 'application/json',

      },
    });
    return response;
  }

  async function patchUsername(id, name) {
  //  const i = phoneNumberFormatter(id);

    var body = {
      "fields": {
        "name": {
          "stringValue": name
        }
      }
    };
    let url = 'https://firestore.googleapis.com/v1/projects/my-pt-zim-fb13e/databases/(default)/documents/users/' + id + '?updateMask.fieldPaths=name';
    let response = await rp(url, {
      method: 'patch',
      json: true,
      body,
      headers: {
        'Content-Type': 'application/json',

      },
    });
    return response;
  }


  server.listen(port, function () {
    console.log('App running on *: ' + port);
  });

