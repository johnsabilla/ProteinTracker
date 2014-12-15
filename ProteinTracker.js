CaffeineData = new Meteor.Collection('caffeineData');
History = new Meteor.Collection('history');


//removed insert/update to database from client that way it cannot
//be available on minimongo
Meteor.methods({
  addCaffeine: function(amount, goal, userId){
      //nsole.log('addCaffeine: ', amount);
      CaffeineData.update({userId : userId}, { $inc : { total : amount } } );
        History.insert({
            value: amount,
            goal: goal,
            date: moment().format("MMMM Do YYYY, h:mm:ss a"),
            userId: userId
        });
  },
  updateGoal: function(goal, userId){
      CaffeineData.update({userId : userId}, {$set : { goal : goal } } );
  }
});


if (Meteor.isClient) {
    Meteor.subscribe('allCaffeineData');
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
           var data = CaffeineData.findOne();
           if(!data) {
              data = {
                  userId: Meteor.userId(),
                  total: 0,
                  goal: 0
              };
              CaffeineData.insert(data);
           }
           return data;
      },
      lastAmount: function () {
          return Session.get('lastAmount');
      },
      goal: function(){
          return Session.get('goal');
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
        var goal = parseInt( $('#goal').val() );

       
        Meteor.call('addCaffeine', amount, goal, this.userId, function(error, id){
          if(error)
            return alert(error.reason);
        });
        
        Session.set('lastAmount', amount);
        Session.set('goal', goal);

      },
      'click #updateGoal' : function(e){
        e.preventDefault();
        var goal = parseInt( $('#goal').val() );

        Meteor.call('updateGoal', goal, this.userId, function(error,id){
          if(error)
            return alert(error.reason);
        });

        Session.set('goal', goal);        
      }
    });
}



if (Meteor.isServer) {

  Meteor.publish('allCaffeineData', function() {
    return CaffeineData.find({ userId: this.userId });
  });

  Meteor.publish('allHistory', function() {
    return History.find({ userId: this.userId }, { sort:{ date: -1 } , limit: 5 } );
  });

  Meteor.startup(function () {
    // code to run on server at startup

    //Uncomment to clear History collection
    //History.remove({});
    //CaffeineData.remove({});
  });
}
