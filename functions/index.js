const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.assignUid = functions.database.ref('/curr_uid').onWrite((change,context) => {

    const activeFinder = admin.database().ref(`/Active/value`).once('value');
    return activeFinder.then(activeFinderRes => {

        const activeRes = activeFinderRes.val();
        if(activeRes === true) {

            const tktNumberFinder = admin.database().ref(`/Active/generated_num`).once('value');
            return tktNumberFinder.then(tktNumberRes => {
                const tktNumber = tktNumberRes.val();

                const numBagsFinder = admin.database().ref(`/Active/num_bags`).once('value');
                return numBagsFinder.then(numBagsRes => {
                    const numBags = numBagsRes.val();

                    const valueFinder = admin.database().ref(`/sih/${tktNumber}`).once('value');
                    return valueFinder.then(valueRes => {

                        console.log('Value is: ',valueRes.val());
                        var jsonObject = valueRes.val();
                        var i = 0;
                        for(i = 0 ; i < numBags ; i++) {
                            var currJson = jsonObject[i];
                            if(!currJson.hasOwnProperty('uid')) {
                                break;
                            }
                        }
                        console.log(i);
                        if(numBags-1 == i) {
                            admin.database().ref(`/sih/${tktNumber}/${i}/uid`).set(change.after.val());
                            admin.database().ref(`/mappings/${change.after.val()}/generated_tkt`).set(tktNumber.toString());
                            admin.database().ref(`/mappings/${change.after.val()}/bag_id`).set(i);
                            admin.database().ref(`/Active/value`).set(false);
                        }
                        else if(numBags == i) {
                            admin.database().ref(`/Active/value`).set(false);
                        }
                        else {
                            admin.database().ref(`/sih/${tktNumber}/${i}/uid`).set(change.after.val());
                            admin.database().ref(`/mappings/${change.after.val()}/generated_tkt`).set(tktNumber.toString());
                            admin.database().ref(`/mappings/${change.after.val()}/bag_id`).set(i);
                        }

                    });
                });
            });
        }
    });
});
