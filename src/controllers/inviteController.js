
const db = require('../utils/db');
const {Forbidden, BadRequest, NotFound} = require('../utils/errors');

ValidateInvitation  = async (userid, groupid) => {
    const groupuser =  await db.raw('SELECT id FROM invitation_users WHERE user_id = ? AND group_id = ? ', [userid, groupid]);;
    const alreadyInGroup = await db('group_users').where('user_id',userid).andWhere('group_id', groupid);
    return (groupuser.rows.length > 0 && alreadyInGroup.length === 0);
}

module.exports.acceptInvite = async (req,res,next) => {
    const groupid = req.params.groupid;

    try {
        if(!groupid){
            throw new BadRequest('No Such Invitation Exists');
        } 
        const existing_invitation = await ValidateInvitation(req.userid, groupid);
        if(!existing_invitation){
            throw new Forbidden('No Such Invitation Exists')
        }

        const newgroup = await db('groups').where('id', groupid).returning('*');
        if(newgroup.length === 0) throw new NotFound('No Such Group Exists');

        await db('group_users').insert({user_id: req.userid, group_id: groupid});
        await db('invitation_users').where('user_id',req.userid).andWhere('group_id', groupid).del();
        res.json(newgroup);
    }
    catch(err){
        next(err);
    }
}

module.exports.declineInvite = async (req,res,next) => {
    const groupid = req.params.groupid;
    
    try {
        if(!groupid){
            throw new BadRequest('No Such Invitation Exists');
        } if(await !ValidateInvitation(req.userid, groupid)){
            throw new Forbidden('No Such Invitation Exists')
        }

        const newgroup = await db('groups').where('id', groupid).returning('*');
        if(newgroup.length === 0) throw new NotFound('No Such Group Exists');

        await db('invitation_users').where('user_id',req.userid).andWhere('group_id', groupid).del();
        res.json(newgroup);

    }
    catch(err){
        next(err);
    }
}

module.exports.sendInvite = async (req,res,next) => {
    const username = req.body.username;
    const groupid = req.body.groupid;

    try {
        if(!username || !groupid) throw new BadRequest('Request Missing Fields : username, id');

        const user = await db('users').where('username',username);
        if(user.length === 0) throw new NotFound('User With Given Username Does Not Exist');
        const belonging = await validateGroupBelonging(req.userid, groupid);
        if(!belonging) throw new Forbidden('');

        await db('invitation_users').insert({user_id:user[0].id, group_id:groupid});
        res.json({message : 'User Successfully Invited'});
    }
    catch(err){
        next(err);
    }
}

module.exports.myInvites = async (req,res,next) => {
    try {
        const myInvites = await db('invitation_users').where('user_id', req.userid);
        res.json(myInvites);
    }
    catch(err){
        next(err);
    }
}