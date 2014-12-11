ProteinData = new Meteor.Collection('protein_data');
History = new Meteor.Collection('history');

Meteor.methods({
  addProtein: function(amount, userId){
      console.log('addProtein: ', amount);
      ProteinData.update({userId : userId}, { $inc : { total : amount } } );
        History.insert({
            value: amount,
            date: new Date().toTimeString(),
            userId: userId
        });
  }

});


if (Meteor.isClient) {
    Meteor.subscribe('allProteinData');
    Meteor.subscribe('allHistory');
    
    Deps.autorun( function(){
      if(Meteor.user()){
          console.log('User: ' + Meteor.user().profile.name + ' is logged in');
      }
      else{
          console.log('User logged out');
      }
    });
    Template.userDetails.helpers({
      user: function() {
           var data = ProteinData.findOne();
           if(!data) {
              data = {
                  userId: Meteor.userId(),
                  total: 0,
                  goal: 200
              };
              ProteinData.insert(data);
           }
           return data;
      },
      lastAmount: function () {
          return Session.get('lastAmount');
      }
    });

    Template.history.helpers({
      historyItem: function() {
          return History.find({},{sort: {date: -1}});
      }
    });

    Template.userDetails.events({
      'click #addAmount' : function(e){
        e.preventDefault();
        var amount = parseInt( $('#amount').val() );
       
        Meteor.call('addProtein', amount, this.userId, function(error, id){
          if(error)
            return alert(error.reason);
        });
        Session.set('lastAmount', amount);
        //console.log('lastAmount', Session.get('lastAmount'));
      }
    });
}

if (Meteor.isServer) {

  Meteor.publish('allProteinData', function() {
    return ProteinData.find({ userId: this.userId });
  });

  Meteor.publish('allHistory', function() {
    return History.find({ userId: this.userId }, { sort:{ date: -1 } , limit: 5 } );
  });

  Meteor.startup(function () {
    // code to run on server at startup

    //Uncomment to clear History collection
    //History.remove({});
    //ProteinData.remove({});
  });
}
