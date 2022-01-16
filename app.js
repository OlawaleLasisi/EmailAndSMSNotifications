const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const twilioClient = require('twilio')();

const Agenda = require('agenda');

const connectionString = 'mongodb://127.0.0.1/tasks';

const agenda = new Agenda({
  db: { address: connectionString, collection: 'mySchedule'}, processEvery: '30 seconds'
});

agenda.define('appointment confirmation', (job, done) => {
  const message = {
    to: job.attrs.data.emailAddress,
    from: 'me@brentschooley.com',
    subject: `Your appointment is confirmed!`,
    text: `
    Thanks for making an appointment to visit the Twilio office.
    We will send you a text message to remind you the day before your appointment.
    See you soon!
    `
  }

  sgMail.send(message);
  done();
});

agenda.define('appointment reminder', (job, done) => {
  twilioClient.messages.create({
    to: job.attrs.data.phoneNumber,
    from: '+12157099508',
    body: `This is a friendly reminder that you have an appointment at the Twilio office tomorrow!`
  })
  .then(() => done());
});

(async function() {
  await agenda.start();

  agenda.now('appointment confirmation', { emailAddress: 'brentfromtwilio@gmail.com'});
  agenda.schedule('in 2 minutes', 'appointment reminder', {
    phoneNumber: process.env.MY_PHONE_NUMBER
  });
  
})().catch(err => console.error(err));