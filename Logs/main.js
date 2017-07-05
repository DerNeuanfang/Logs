/*
Beteiligte Programmierer: DerNeuanfang
Lizens: General Public License (https://opensource.org/licenses/GPL-3.0)


*/

var App = (new function () {
	var	instance			= this;
	var logaktiv = false;
	var Bot = undefined;
	var log = {};
	
	this.onUserJoined = function onUserJoined(user) {
		if(!logaktiv){
			return;
		}
		
		log['txt'].push('°GG°'+user.getNick().escapeKCode() + ' betritt den Channel.°r°');
	}
	
	this.onAppStart = function onAppStart() {
		Bot = KnuddelsServer.getDefaultBotUser();
		logaktiv = false;
	}
	
	this.onPublicMessage = function(publicMessage){
		var user = publicMessage.getAuthor();
		var txt = publicMessage.getText();
		
		log['txt'].push(user.getNick() + ': '+txt);
	},
	
	this.chatCommands = {
		
		
		addc:function(user, params){
			if(!user.isAppManager()){
				return;
			}
			
			if(!logaktiv){
				user.sendPrivateMessage('Es ist kein Log aktiv');
				return;
			}
			
			log['txt'].push('°GG°Log-Kommentar' + ': '+params+'°r°');
			
			user.sendPrivateMessage('Der Kommentar:°#° '+params+'°#° Wurde Hinzugefügt und ist im Log sichtbar.');
			
			
		},
		startlog:function(user){
			if(!user.isAppManager()){
				return;
			}
			
			logaktiv = true;
			var times = new Date().getTime();
			
			var id = KnuddelsServer.getPersistence().addNumber('LogIds', 1);
			var users			= KnuddelsServer.getChannel().getOnlineUsers(UserType.Human);
			
			log = {id: id, datum: times, uir: users, txt:[]};
			
			
			for(i=0;i<users.length;i++){
				var ids = users[i].getPersistence().getObject('UserLogIds', []);
				ids.push(id);
				users[i].getPersistence().setObject('UserLogIds', ids);
			}
			
			user.sendPrivateMessage('Alle öffentliche Logs werden nun gespeichert. Die ID dafür ist: '+id);
			
		},
		
		resetalllog:function(user){
			if(!user.isAppManager()){
				return;
			}
			
			if(logaktiv){
				user.sendPrivateMessage('Es ist noch ein Log aktiv.');
				return;
			}
			KnuddelsServer.getPersistence().setObject('_logsdata', []);
			KnuddelsServer.getPersistence().setNumber('LogIds', 0);
			
			UserPersistenceObjects.deleteAll('UserLogIds');
		},
		
		stoplog:function(user){
			if(!user.isAppManager()){
				return;
			}
			
			if(!logaktiv){
				user.sendPrivateMessage('Es ist kein Log aktiv.');
				return;
			}
			
			logaktiv = false;
			
			var id = KnuddelsServer.getPersistence().getNumber('LogIds', 0);
			
			KnuddelsServer.getPersistence().setObject('_logs'+id, log);
			
			var logids = KnuddelsServer.getPersistence().getObject('_logsdata', []);
			logids.push(id);
			KnuddelsServer.getPersistence().setObject('_logsdata', logids);
			
			user.sendPrivateMessage('Der Log wurde gestoppt und gespeichert.');
			
			
		},
		
		dellog:function(user, params){
			if(!user.isAppManager()){
				return;
			}
			
			if(logaktiv){
				user.sendPrivateMessage('Die Aktiven Logs, müssen erst deaktiviert werden.');
				return;
			}
			
			var logids = KnuddelsServer.getPersistence().getObject('_logsdata', []);
			params = parseInt(params);
			
			if(logids.indexOf(params) >= 0){
				logids.splice(logids.indexOf(params),1);
				KnuddelsServer.getPersistence().setObject('_logsdata', logids);
				var logdata = KnuddelsServer.getPersistence().getObject('_logs'+params, {});
				
				var users = logdata.uir;
				
				for(i=0;i<users.length;i++){
					var ids = users[i].getPersistence().getObject('UserLogIds', []);
					ids.splice(ids.indexOf(params),1);
					users[i].getPersistence().setObject('UserLogIds', ids);
				}
				
				KnuddelsServer.getPersistence().deleteObject('_logs'+params);
				
				user.sendPrivateMessage('Log '+params+' wurde gelöscht.');
				
			} else {
				user.sendPrivateMessage('Ich kenne diesen Log leider nicht.');
			}
		},
		
		resetName:function(user,params){
			if(!user.isAppManager()){
				return;
			}
			
			if(logaktiv){
				user.sendPrivateMessage('Die Aktiven Logs, müssen erst deaktiviert werden.');
				return;
			}
			var logids = KnuddelsServer.getPersistence().getObject('_logsdata', []);
			
			
			params = parseInt(params);
			
			if(logids.indexOf(params) == -1){
				user.sendPrivateMessage('Ich finde keinen Log mit der ID '+params);
				return;
			} else {
				//logdata = {id: id, datum: times, commend: undefined, uir: users, txt:[]};
				var logdata = KnuddelsServer.getPersistence().getObject('_logs'+params, {});
				logdata.commend = undefined
				KnuddelsServer.getPersistence().setObject('_logs'+params, logdata);
				user.sendPrivateMessage('Tittel zurückgesetzt.');
			}
		},
		
		comlog:function(user,params){
			if(!user.isAppManager()){
				return;
			}
			
			if(logaktiv){
				user.sendPrivateMessage('Die Aktiven Logs, müssen erst deaktiviert werden.');
				return;
			}
			var logids = KnuddelsServer.getPersistence().getObject('_logsdata', []);
			
			var actions = params.split('~~');
			
			if(actions.length != 2){
				user.sendPrivateMessage('Etwas an der Eingabe stimmt nicht...');
				return;
			}
			
			actions[0] = parseInt(actions[0]);
			
			if(logids.indexOf(actions[0]) == -1){
				user.sendPrivateMessage('Ich finde keinen Log mit der ID '+actions[0].escapeKCode());
				return;
			} else {
				//logdata = {id: id, datum: times, uir: users, txt:[]};
				var logdata = KnuddelsServer.getPersistence().getObject('_logs'+actions[0], {});
				actions[1] = actions[1].escapeKCode();
				logdata.commend = actions[1];
				KnuddelsServer.getPersistence().setObject('_logs'+actions[0], logdata);
				user.sendPrivateMessage('Erfolgreich umbenannt.');
			}	
			
			
			
		},
		
		showlog:function(user, params){
			if(!user.isAppManager()){
				return;
			}
			
			if(logaktiv){
				user.sendPrivateMessage('Die Aktiven Logs, müssen erst deaktiviert werden.');
				return;
			}
			var logids = KnuddelsServer.getPersistence().getObject('_logsdata', []);
			
			if(params.length == 0){
				var msg = 'Übersicht der Logs:°#°'
				for(i=0;i<logids.length;i++){
					var logdata = KnuddelsServer.getPersistence().getObject('_logs'+logids[i], {});
										
					if(logdata.commend != undefined){
						msg += '°>ID:'+logids[i]+' ~ '+logdata.commend+'|/showlog '+logids[i]+'<°'
					} else {
						msg += '°>ID:'+logids[i]+' - Am: '+ new Date(logdata.datum)+' mit ' + logdata.uir.join(',')+'|/showlog '+logids[i]+'<°'
					}
					
					
					msg += ' °YY°°>Umbenennen|/tf-overridesb /comlog '+logids[i]+'~~[NeuerTittel]<° °RR° °>Löschen|/dellog '+logids[i]+'<°°r° '
					
					if(logdata.commend != undefined){
						msg += '°>Umbennung löschen|/resetName '+logids[i]+'<°°#°';
					}
					msg += '°#°'
					
				}
				
				user.sendPrivateMessage(msg);
			} else {
				params = parseInt(params);
				if(logids.indexOf(params) == -1){
					user.sendPrivateMessage('Ich finde keinen Log mit der ID '+params.escapeKCode());
					return;
				} else {
					//logdata = {id: id, datum: times, uir: users, txt:[]};
					var logdata = KnuddelsServer.getPersistence().getObject('_logs'+params, {});
					
					var msg = 'Log '+logdata.id + ' vom '+ new Date(logdata.datum) +' mit '+logdata.uir.join(',')+' °#°'
						msg += logdata.txt.join('°#°');
						user.sendPrivateMessage(msg);
				}		
			}
	
		},
		
		searchlog:function(user,params){
			if(!user.isAppManager()){
				return;
			}
			
			if(logaktiv){
				user.sendPrivateMessage('Die Aktiven Logs, müssen erst deaktiviert werden.');
				return;
			}
			
			var UserAccess = KnuddelsServer.getUserAccess();
			
			var u = UserAccess.exists(params)
			if(!u){
				user.sendPrivateMessage('Ich kenne den User nicht.');
				return;
			}
					
			var uId = UserAccess.getUserId(params);
				
			if(UserAccess.mayAccess(uId)) {
				
				var knuser = UserAccess.getUserById(uId);
				
				var logids = knuser.getPersistence().getObject('UserLogIds', []);
				var msg = 'Übersicht der Logs °#°'
				for(i=0;i<logids.length;i++){
					var logdata = KnuddelsServer.getPersistence().getObject('_logs'+logids[i], {});
					
					msg += ' °>ID:'+logids[i]+' - Am: '+ new Date(logdata.datum)+' mit ' + logdata.uir.join(',')+'|/showlog '+logids[i]+'<° °#°'
				}
				
				user.sendPrivateMessage(msg);
				

			} else {
				user.sendPrivateMessage('Ich kenne den User nicht.');
			}	
		}
	
	}
	
	this.onUserLeft  = function onUserLeft(user){
		
		if(!logaktiv){
			return;
		}
		
		log['txt'].push('°GG°'+user.getNick().escapeKCode() + ' verlässt den Channel.°r°');
		
		var users			= KnuddelsServer.getChannel().getOnlineUsers(UserType.Human);
		
		if(users.length <= 0){
			logaktiv = false;
			
			var id = KnuddelsServer.getPersistence().getNumber('LogIds', 0);
			
			KnuddelsServer.getPersistence().setObject('_logs'+id, log);
			
			var logids = KnuddelsServer.getPersistence().getObject('_logsdata', []);
			logids.push(id);
			KnuddelsServer.getPersistence().setObject('_logsdata', logids);

		}
		
		
	};
	

});