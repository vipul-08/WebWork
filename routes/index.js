const express=require('express');
const router=express.Router();
const Ticket=require('../models/ticket');
const Bags=require('../models/Bags');
const faker=require('faker');


var firebase=require('firebase');

firebase.initializeApp({
    serviceAccount: "testing-eb3a3f6683ae.json",
    databaseURL: "https://testing-200101.firebaseio.com/"

});




var ref=firebase.database().ref('sih');
var newRef = firebase.database().ref('EmailMap');

router.all('/*',(req,res,next)=>{

    req.app.locals.layout='main';
    next();
});


router.get('/',(req,res)=>{

    res.render('home');

});


router.post('/generate-ticket',(req,res)=> {

    let passenger=new Ticket();
    let ticket=new Ticket();

    ticket.passengerName=req.body.PassengerName;
    ticket.source=faker.address.country();
    ticket.destination=faker.address.country();
    ticket.flightNumber=faker.random.number();
    ticket.seatNumber=faker.random.number();
    ticket.date=faker.date.recent();
    ticket.phoneNumber=faker.phone.phoneNumber();
    ticket.BookingId=req.body.bookingId;
    ticket.numberOfBags=req.body.numberOfBags;
    ticket.TicketNumber=faker.random.number();
    ticket.Email=req.body.PassengerEmail;
    ticket.save().then((newTicket)=>{

        //var messageRef=messagesRef.push();

        var messageKey=newTicket.TicketNumber;
        var numberOfBags=newTicket.numberOfBags;
        var payload={};
        var message={
            numberOfBags: numberOfBags
        };

        //payload['tickets/'+messageKey]=message;


        //console.log(messageRef.key);

       // ref.update(payload);

        var messagesRef=ref.child(messageKey);
        messagesRef.set(message);

        var mapRef = newRef.child(newTicket.TicketNumber);
        mapRef.set({email : newTicket.Email});

        var message2={

            1: { status: false},
            2: { status: false},
            3: { status: false}
        };


        for(var i=0;i<numberOfBags;i++){
            var childOfmessagesRef=messagesRef.child(i);
            var child=childOfmessagesRef.child('Status');
            child.set(message2);




        }


        // var messagesRefChild=messagesRef.child('status');
        // messagesRefChild.push({1:true});


        var emailMapping = firebase.database().ref('EmailMapping');
        var active=firebase.database().ref('Active');

        var obj={

            value: true,
            num_bags: numberOfBags,
            generated_num: messageKey


        };

        active.set(obj);

    });
});


router.post("/add-up-database",(req,res)=>{


    var user;
    ref.on('value', function (snap) {
        user = snap.val();

    // Keep the local user object synced with the Firebase userRef

    console.log(user);
});






});



module.exports=router;
