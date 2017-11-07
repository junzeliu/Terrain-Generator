/**
 * @fileoverview Utilities for supporting rendering a terrain and animation.
 */

/**
 * Transform the angle to quaternion to help roll to left
 * Apply the quaternion transformation to global guaternion 'transquat'
 */
function roll_left(rotation_in_radians) {
    //create a new quaternion
	var tempQuat = quat.create();
    
    //create a quaternion form the angle and set axisangle.
    tempQuat = quat.setAxisAngle(tempQuat,axis_of_roll, degToRad(rotation_in_radians)); 
	
    //normalize the quaternion
    quat.normalize(tempQuat, tempQuat);
	quat.multiply(transquat, transquat, tempQuat);
	quat.normalize(transquat,transquat);

}

//-------------------------------------------------------------------------
/**
 * Transform the angle to quaternion to help roll to right
 * Apply the quaternion transformation to global guaternion 'transquat'
 */
function roll_right(rotation_in_radians) {
	var tempQuat = quat.create();
    tempQuat = quat.setAxisAngle(tempQuat,axis_of_roll, degToRad(rotation_in_radians));
	quat.normalize(tempQuat, tempQuat);
	quat.multiply(transquat, transquat, tempQuat);
	quat.normalize(transquat,transquat);
}

//-------------------------------------------------------------------------
/**
 * Transform the angle to quaternion to help pitch up
 * Apply the quaternion transformation to global guaternion 'transquat'
 */
function pitch_up(rotation_in_radians) {
	var tempQuat = quat.create();
	tempQuat = quat.setAxisAngle(tempQuat,axis_of_pitch, degToRad(rotation_in_radians));
	quat.normalize(tempQuat, tempQuat);
	quat.multiply(transquat, transquat, tempQuat);
	quat.normalize(transquat,transquat);
}

//-------------------------------------------------------------------------
/**
 * Transform the angle to quaternion to help to pitch down
 * Apply the quaternion transformation to global guaternion 'transquat'
 */
function pitch_down(rotation_in_radians) {
	var tempQuat = quat.create();
	tempQuat = quat.setAxisAngle(tempQuat,axis_of_pitch, degToRad(rotation_in_radians));
	quat.normalize(tempQuat, tempQuat);
	quat.multiply(transquat, transquat, tempQuat);
	quat.normalize(transquat,transquat);
}

//-------------------------------------------------------------------------
/**
 * Change the speed of moving forward
 */
function fast_speed(sign_fast) {
	var acceleration = 0.00002;
	speed += sign_fast*acceleration; 
}

//-------------------------------------------------------------------------
/**
 * to change the speed of moving forward
 */
function slow_speed(sign_slow) {
	var acceleration = 0.00002;
	if (speed<=0){
		speed += sign_slow*acceleration; 
	}
}

//-------------------------------------------------------------------------
/**
 * Transform the angle to quaternion to help to yaw left
 * Apply the quaternion transformation to global guaternion 'transquat'
 */
function yaw_left(rotation_in_radians) {
	var tempQuat = quat.create();
	tempQuat = quat.setAxisAngle(tempQuat,axis_of_yaw, degToRad(rotation_in_radians));
	quat.normalize(tempQuat, tempQuat);
	quat.multiply(transquat, transquat, tempQuat);
	quat.normalize(transquat,transquat);
}

//-------------------------------------------------------------------------
/**
 * Transform the angle to quaternion to help to yaw right
 * Apply the quaternion transformation to global guaternion 'transquat'
 */
function yaw_right(rotation_in_radians) {
	var tempQuat = quat.create();
	tempQuat = quat.setAxisAngle(tempQuat,axis_of_yaw, degToRad(rotation_in_radians));
	quat.normalize(tempQuat, tempQuat);
	quat.multiply(transquat, transquat, tempQuat);
	quat.normalize(transquat,transquat);

}
