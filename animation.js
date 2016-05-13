// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// very little in it - you will fill it in with all your shape drawing calls and any extra key / mouse controls.  

// Now go down to display() to see where the sample shapes are drawn, and to see where to fill in your own code.
//import java.util.Stack
"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), 	looking = false, prev_time = 0, animate = false, animation_time = 0;
		var gouraud = false, color_normals = false, solid = false;
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( vec4( .8,.3,.8,1 ), .5, 1, 1, 40, "" ) ); }


function RobotPerson(){
	this.pos = vec3();
	this.pos[0] = 0;
	this.pos[1] = -5;
	this.pos[2] = -10;
	//this.headRot = scale_vec();
	this.headRot = 0;
	//this.eyePos = scale_vec();
	this.eyePos = 0;
}

function Seagull(){
	this.pos = vec3();
	this.pos[0] = 0;
	this.pos[1] = 1;
	this.pos[2] = 2;
}
var Robot;
Robot = new RobotPerson();

var Bird1 = new Seagull();

var Bird2 = new Seagull();
var Bird3 = new Seagull(); 

// *******************************************************
// IMPORTANT -- In the line below, add the filenames of any new images you want to include for textures!

var texture_filenames_to_load = [ "stars.png", "text.png", "earth.gif" ];

// *******************************************************	
// When the web page's window loads it creates an "Animation" object.  It registers itself as a displayable object to our other class "GL_Context" -- which OpenGL is told to call upon every time a
// draw / keyboard / mouse event happens.

window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self) 
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );
		
		gl.clearColor( 0, 0, 0, .55 );			// Background color
		
		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );
		
		self.m_cube = new cube();
		self.m_obj = new shape_from_file( "teapot.obj" )
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 4 );	
		self.m_fan = new triangle_fan_full( 10, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_cylinder = new cylindrical_strip( 10, mat4() );
		self.m_triangle = new triangle();
		self.m_balloon = new balloon();
		self.m_capped = new capped_cylinder();
		
		// 1st parameter is camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, 0,-40), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );

		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);
		
		self.context.render();	
	} ) ( this );	
	
	canvas.addEventListener('mousemove', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});
}

// *******************************************************	
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "f",     function() { looking = !looking; } );
	shortcut.add( ",",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;
	shortcut.add( ".",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;

	shortcut.add( "r",     ( function(self) { return function() { self.graphicsState.camera_transform = mat4(); }; } ) (this) );
	shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);	
																		gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	shortcut.add( "ALT+a", function() { animate = !animate; } );
	
	shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
	shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );	
}

function update_camera( self, animation_delta_time )
	{
		var leeway = 70, border = 50;
		var degrees_per_frame = .0002 * animation_delta_time;
		var meters_per_frame  = .01 * animation_delta_time;
																					// Determine camera rotation movement first
		var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
		var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
		var outside_border = false;
		
		for( var i = 0; i < 2; i++ )
			if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

		for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

// *******************************************************	
// display(): called once per frame, whenever OpenGL decides it's time to redraw.

Animation.prototype.display = function(time)
	{
		var stack = [];
		if(!time) time = 0;
		this.animation_delta_time = time - prev_time;
		if(animate) this.graphicsState.animation_time += this.animation_delta_time;
		prev_time = time;
		
		update_camera( this, this.animation_delta_time );
			
		this.basis_id = 0;
		
		var model_transform = mat4();
		//stack.push(model_transform);
		// Materials: Declare new ones as needed in every function.
		// 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
		var purplePlastic = new Material( vec4( .9,.5,.9,1 ), .2, .5, .8, 40 ), // Omit the final (string) parameter if you want no texture
			greyPlastic = new Material( vec4( .5,.5,.5,1 ), .7, .8, .5, 40 ),
			green = new Material( vec4((153/255), 1, (153/255), 1), .6, .5, .1, 40),
			yellow = new Material( vec4(1, 1, (102/255), 1), .3, .7, 1, 40),
			ballOrange = new Material( vec4(.9, (153/255), (51/255), 1), .6, .1, .5, 40),
			red = new Material( vec4(1, .1, .1, 1), .7, .1, .1, 40),
			pink = new Material( vec4(1, (153/255), 1, 1), .7, .1, .1, 40),
			blue = new Material( vec4((153/255), 1, 1, 1), .6, .5, 1, 40),
			earth = new Material( vec4( .5,.5,.5,1  ), .5, 1, .5, 40, "earth.gif" ),
			stars = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "stars.png" ),
			black =  new Material( vec4(0, 0, 0, 1), .7, .1, .1, 40);
			
		/**********************************
		Start coding here!!!!
		**********************************/
		var oldTime = 0;
		var scene1 = 2400;
		var scene1half = scene1 + 3000;
		var scene2 = scene1half + 3000;
		var scene3 = scene2 + 4000;
		stack.push(model_transform);
		/**********************************
		Scene 1!!!!
		**********************************/

		if(this.graphicsState.animation_time < scene1){ //scene one, robot walking, birds right to left
			//ground plane
			stack.push(model_transform);
			this.graphicsState.camera_transform = lookAt(vec3(0, 0, Robot.pos[2]+12), vec3(Robot.pos[0], Robot.pos[1], Robot.pos[2]-4), vec3(0, 1, 0));
			model_transform = mult(model_transform, translation(0, -5, -10));
			stack.push(model_transform);
			model_transform = mult(model_transform, scale(200, .0001, 200));
			this.m_cube.draw(this.graphicsState, model_transform, green);
			model_transform = stack.pop();
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(-3, 0, 0));
			this.m_cube.draw(this.graphicsState, model_transform, blue);
			model_transform = stack.pop();
			model_transform = stack.pop();
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(Robot.pos[0], Robot.pos[1], Robot.pos[2]));
			this.draw_robot_walk( model_transform, yellow, red, stack, 1);

			//draw birds
			model_transform = mult(model_transform, translation(5 - this.graphicsState.animation_time/200, 5, 0));
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(0, 0, 4));

			stack.push(model_transform);
			model_transform = mult(model_transform, translation(0, .2*Math.sin(this.graphicsState.animation_time/1000), 0));
			model_transform = mult(model_transform, scale(.4, .4, .4));
			this.draw_bird(model_transform, stack, yellow, red, blue, green);
			model_transform = stack.pop();

			stack.push(model_transform);
			model_transform = mult(model_transform, translation(1, .7, 3));
			model_transform = mult(model_transform, translation(0, .4*Math.sin(this.graphicsState.animation_time/1000), 0));
			this.draw_bird(model_transform, stack, yellow, red, blue, green);

			model_transform = stack.pop();
			model_transform = stack.pop();
			model_transform = stack.pop();

			//draw birds over robots head
			/*stack.push(model_transform);
			model_transform = mult(model_transform, translation(Robot.pos[0], Robot.pos[1] + 7, -10));
			this.draw_bird( model_transform, stack, yellow, red, blue, green);
			model_transform = stack.pop();
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(Robot.pos[0]+2, Robot.pos[1] + 7, -10));
			this.draw_bird(model_transform, stack, yellow, red, blue, green);
			model_transform = stack.pop();*/
			if(animate)
			{
				oldTime = this.graphicsState.animation_time;
				Robot.pos[2] = Robot.pos[2] + 0.017;
			}
		}
		else if(this.graphicsState.animation_time < scene1half){
			var timeSinceStart = this.graphicsState.animation_time - scene1half;

			this.graphicsState.camera_transform = lookAt(vec3(0, 0, Robot.pos[2]+12), vec3(Robot.pos[0], Robot.pos[1], Robot.pos[2]-4), vec3(0, 1, 0));
			stack.push(model_transform);
			this.graphicsState.camera_transform = lookAt(vec3(0, 0, Robot.pos[2]+12), vec3(Robot.pos[0], Robot.pos[1], Robot.pos[2]-4), vec3(0, 1, 0));
			model_transform = mult(model_transform, translation(0, -5, -10));
			stack.push(model_transform);
			model_transform = mult(model_transform, scale(200, .0001, 200));
			this.m_cube.draw(this.graphicsState, model_transform, green);
			model_transform = stack.pop();
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(-3, 0, 0));
			this.m_cube.draw(this.graphicsState, model_transform, blue);
			model_transform = stack.pop();
			model_transform = stack.pop();
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(Robot.pos[0], Robot.pos[1], Robot.pos[2]));
			this.draw_robot_walk( model_transform, yellow, red, stack, 2);
			//model_transform = stack.pop();


			//draw birds
			model_transform = mult(model_transform, translation(5 - timeSinceStart/200, 0, 0));
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(0, 0, 4));

			stack.push(model_transform);
			model_transform = mult(model_transform, translation(0, .2*Math.sin(this.graphicsState.animation_time/1000), 0));
			model_transform = mult(model_transform, scale(.4, .4, .4));
			this.draw_bird(model_transform, stack, yellow, red, blue, green);
			model_transform = stack.pop();

			stack.push(model_transform);
			model_transform = mult(model_transform, translation(1, .7, 3));
			model_transform = mult(model_transform, translation(0, .4*Math.sin(this.graphicsState.animation_time/1000), 0));
			this.draw_bird(model_transform, stack, yellow, red, blue, green);

			model_transform = stack.pop();
			model_transform = stack.pop();
			model_transform = stack.pop();

		}
			else if(this.graphicsState.animation_time < scene2){ //scene two, pan up whiel robot walking
		stack.push(model_transform);
			this.graphicsState.camera_transform = lookAt(vec3(0, 0, Robot.pos[2]+12), vec3(Robot.pos[0], Robot.pos[1], Robot.pos[2]-4), vec3(0, 1, 0));
			model_transform = mult(model_transform, translation(0, -5, -10));
			stack.push(model_transform);
			model_transform = mult(model_transform, scale(200, .0001, 200));
			this.m_cube.draw(this.graphicsState, model_transform, green);
			model_transform = stack.pop();
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(-3, 0, 0));
			this.m_cube.draw(this.graphicsState, model_transform, blue);
			model_transform = stack.pop();
			model_transform = stack.pop();
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(Robot.pos[0], Robot.pos[1], Robot.pos[2]));
			this.draw_robot_walk( model_transform, yellow, red, stack, 1);

			if(animate){
				Robot.headRot = Robot.headRot - .3;
				Robot.eyePos = Robot.eyePos + .0007;
			}
			model_transform = stack.pop();
			
			if(animate)
			{
				oldTime = this.graphicsState.animation_time;
				Robot.pos[2] = Robot.pos[2] + 0.017;
			}
		}
		else if(this.graphicsState.animation_time < scene3){

			stack.push(model_transform);
			var timeSinceStart = this.graphicsState.animation_time - scene1;
			//this.graphicsState.camera_transform = lookAt(vec3(-5, -2, 2), vec3(4, -4 + timeSinceStart/1000, -10), vec3(0, 1, 0));
			stack.push(model_transform);
			model_transform = mult(model_transform, translation(0, -5, -10));
			model_transform = mult(model_transform, scale(200, .0001, 200));
			this.m_cube.draw(this.graphicsState, model_transform, green);
			model_transform = stack.pop();

			stack.push(model_transform);
			model_transform = mult(model_transform, translation(Robot.pos[0], Robot.pos[1], Robot.pos[2]));
			this.draw_robot_walk( model_transform, yellow, red, stack, 1);
			model_transform = stack.pop();
			
			if(animate)
			{
				oldTime = this.graphicsState.animation_time;
				Robot.pos[2] = Robot.pos[2] + 0.017;
			}
		}
 		else{
		//set up our initial postioning
model_transform = mult( model_transform, translation( 1, -5, -10) );	
		model_transform = mult(model_transform, scale(2, 2, 2));


		//A//nimation.prototype.draw_balloon_clump = function( model_transform, yellow, blue, green, red, pink)
		this.draw_balloon_clump(model_transform, stack, yellow, blue, green, ballOrange, pink);
	this.draw_bird(model_transform, stack, yellow, red, blue, green);

	model_transform = mult(model_transform, translation(-12, 0, 0));
	this.draw_robot_walk( model_transform, yellow, red, stack, 1);
	}

}
Animation.prototype.draw_wings = function( model_transform, stack, yellow){
	//left wing
	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0, .2, .2));
	model_transform = mult(model_transform, rotation(-35 + 20*Math.abs(Math.sin(this.graphicsState.animation_time/300)), 1, 0, 0));
	model_transform = mult(model_transform, translation(0, 0, .3));
	stack.push(model_transform);
	model_transform = mult(model_transform, scale(.7, .08, .6));
	this.m_cube.draw(this.graphicsState, model_transform, yellow);
	model_transform = stack.pop(); //we're in middle of first part 
	model_transform = mult(model_transform, translation(0, 0, .3));
	model_transform = mult(model_transform, rotation(25 + 20*Math.sin(this.graphicsState.animation_time/150), 1, 0, 0));
	//model_transform = mult(model_transform, rotation(20 * Math.sin(this.graphicsState.animation_time/1000), 1, 0, 0);
	model_transform = mult(model_transform, translation(0, 0, .4));
	model_transform = mult(model_transform, scale(.7, .08, .8));
	this.m_cube.draw(this.graphicsState, model_transform, yellow);
	model_transform = stack.pop();


	//right wing
	stack.push(model_transform);

	model_transform = mult(model_transform, translation(0, .2, -.2));
	model_transform = mult(model_transform, rotation(35 + -20*Math.abs(Math.sin(this.graphicsState.animation_time/300)), 1, 0, 0));
	model_transform = mult(model_transform, translation(0, 0, -.3));
	stack.push(model_transform);
	model_transform = mult(model_transform, scale(.7, .08, .6));
	this.m_cube.draw(this.graphicsState, model_transform, yellow);
	model_transform = stack.pop(); //we're in middle of first part 
	model_transform = mult(model_transform, translation(0, 0, -.3));
	model_transform = mult(model_transform, rotation(-25 + -20*Math.sin(this.graphicsState.animation_time/150), 1, 0, 0));
	//model_transform = mult(model_transform, rotation(20 * Math.sin(this.graphicsState.animation_time/1000), 1, 0, 0);
	model_transform = mult(model_transform, translation(0, 0, -.4));
	model_transform = mult(model_transform, scale(.7, .08, .8));
	this.m_cube.draw(this.graphicsState, model_transform, yellow);
	model_transform, stack.pop();
	

}

Animation.prototype.draw_bird = function( model_transform, stack, yellow, red, blue, green){
	stack.push(model_transform);
	model_transform = mult(model_transform, scale(1, .4, .4));
	this.m_sphere.draw(this.graphicsState, model_transform, yellow);
	model_transform = stack.pop();
	this.draw_wings(model_transform, stack, yellow);

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(-1 - 0.3, 0, 0));
	stack.push(model_transform);

	//head
	model_transform = mult(model_transform, scale(.3, .3, .3));
	this.m_sphere.draw(this.graphicsState, model_transform, yellow);
	model_transform = stack.pop();

	model_transform = mult(model_transform, translation(-.3 -.3, 0, 0));
	model_transform = mult(model_transform, scale(.3, .1, .1));
	model_transform = mult(model_transform, rotation(-90, 0, 1, 0));
	this.m_fan.draw(this.graphicsState, model_transform, yellow);



	}

Animation.prototype.draw_balloon_clump = function( model_transform, stack, yellow, blue, green, red, pink){
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(0, .5, 0));
		model_transform = this.draw_balloon(model_transform, pink, stack, 29);
		
		model_transform = stack.pop();
	//second layer of balloons
	model_transform = this.draw_balloon_row(model_transform, yellow, stack, 27, 12.5, 7, 0, 8);
	model_transform = this.draw_balloon_row(model_transform, red, stack, 25, 25, 14, 20, 8);
	model_transform = this.draw_balloon_row(model_transform, green, stack, 21, 32, 14, 40, 8);
	model_transform = this.draw_balloon_row(model_transform, blue, stack, 16, 35, 12, 40, 8);
	//inner layer
	model_transform = this.draw_balloon_row(model_transform, blue, stack, 21, 17, 6, 40, 8);
	model_transform = this.draw_balloon_row(model_transform, pink, stack, 16, 19, 6, 40, 8);

}

Animation.prototype.draw_balloon_row = function( model_transform, yellow, stack, height, slant, num, offset, spin){
		var NUM_BALLOONS = num;
	stack.push(model_transform);
	model_transform = mult(model_transform, rotation(2 * Math.sin(this.graphicsState.animation_time/2000), 0, 0, 1));
	model_transform = mult(model_transform, rotation(spin*Math.sin(this.graphicsState.animation_time/(3000)), 0, 1, 0));
	for(var i = 0; i < NUM_BALLOONS; i++){
		
		var spin = i * 360 / NUM_BALLOONS;
		var DEGREES_SLANT = slant;
		stack.push(model_transform);
		model_transform = mult(model_transform, rotation(spin + offset, 0, 1, 0));
		model_transform = mult(model_transform, rotation(DEGREES_SLANT, 1, 0, 0));
		model_transform = mult(model_transform, translation(0, .5, 0));
		this.draw_balloon(model_transform, yellow, stack, height);
		model_transform = stack.pop();
	}
	model_transform = stack.pop();
	return model_transform;
}

	Animation.prototype.draw_balloon = function( model_transform, yellow, stack, height)
	{
		var STRING_HEIGHT = .4;

		for(var string = 0; string < height; string++){

			stack.push(model_transform);
			model_transform = mult(model_transform, rotation(90, 1, 0, 0));
			model_transform = mult(model_transform, scale(.01, .01, STRING_HEIGHT));
			this.m_cylinder.draw(this.graphicsState, model_transform, yellow);
			model_transform = stack.pop();
			model_transform = mult(model_transform, translation(0, STRING_HEIGHT, 0));
		}
		stack.push(model_transform);
		//this.m_sphere.draw(this.graphicsState, model_transform, yellow);
		/*model_transform = mult(model_transform, translation(0, -1.0, 0));
		model_transform = mult(model_transform, scale(.72, .3, .72));
		model_transform = mult(model_transform, rotation(90, 1, 0, 0));
		this.m_fan.draw(this.graphicsState, model_transform, yellow);
		this.m_cylinder.draw(this.graphicsState, model_transform, yellow);*/
		this.m_balloon.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();
		return model_transform;
	}

Animation.prototype.draw_robot_walk = function( model_transform, yellow, red, stack, sceneNum){

	if(sceneNum == 1){
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		model_transform = mult(model_transform, translation(0, 0, .2*Math.sin(this.graphicsState.animation_time/200)));
		model_transform = mult(model_transform, scale(.4, .3, .4));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(.35, 0, 0));
		model_transform = mult(model_transform, translation(0, 0, -.2*Math.sin(this.graphicsState.animation_time/200)));
		model_transform = mult(model_transform, scale(.4, .3, .4));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		//model_transform = stack.pop();
	}
	else if(sceneNum ==2){


		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		model_transform = mult(model_transform, scale(.4, .3, .4));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(.35, 0, 0));
		model_transform = mult(model_transform, scale(.4, .3, .4));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();

		model_transform = mult(model_transform, translation(.35, .04 + .15, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.55, .08, .55));
		
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		model_transform = mult(model_transform, scale(.55, .08, .55));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		model_transform = mult(model_transform, translation(0, .04 +.075, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(1.3, .15, .91));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		model_transform = mult(model_transform, translation(0, .04 + .6, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(1.5, 1.2, 1));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		//neck

		model_transform = mult(model_transform, translation(0, .6 + .07, 0 ));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.5, .14, .5));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		//head
		model_transform = mult(model_transform, translation(0, .07 + .5, 0));
		stack.push(model_transform);
		this.m_cube.draw(this.graphicsState, model_transform, yellow);

		//eyes
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.2, Robot.eyePos, .5));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.1, .1, .1));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		model_transform = mult(model_transform, translation(.4, 0, 0));
		model_transform = mult(model_transform, scale(.1, .1, .1));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();


		return model_transform;

	}
	else if(sceneNum ==3){
	model_transform = mult(model_transform, translation(.35, .04 + .15, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.55, .08, .55));
		
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		model_transform = mult(model_transform, scale(.55, .08, .55));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		model_transform = mult(model_transform, translation(0, .04 +.075, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(1.3, .15, .91));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		model_transform = mult(model_transform, translation(0, .04 + .6, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(1.5, 1.2, 1));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		//neck

		model_transform = mult(model_transform, translation(0, .6 + .07, 0 ));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.5, .14, .5));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		//head
		model_transform = mult(model_transform, translation(0, .07 + .5, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, rotation(Robot.headRot, 0, 1, 0));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);

		//eyes
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.2, Robot.eyePos, .5));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.1, .1, .1));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		model_transform = mult(model_transform, translation(.4, 0, 0));
		model_transform = mult(model_transform, scale(.1, .1, .1));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		return model_transform;
	}


		model_transform = mult(model_transform, translation(.35, .04 + .15, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.55, .08, .55));
		
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		model_transform = mult(model_transform, scale(.55, .08, .55));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		model_transform = mult(model_transform, translation(0, .04 +.075, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(1.3, .15, .91));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		model_transform = mult(model_transform, translation(0, .04 + .6, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(1.5, 1.2, 1));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		//neck

		model_transform = mult(model_transform, translation(0, .6 + .07, 0 ));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.5, .14, .5));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		//head
		model_transform = mult(model_transform, translation(0, .07 + .5, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, rotation(Robot.headRot, 0, 1, 0));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);

		//eyes
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.2, Robot.eyePos, .5));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.1, .1, .1));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		model_transform = mult(model_transform, translation(.4, 0, 0));
		model_transform = mult(model_transform, scale(.1, .1, .1));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();

		return model_transform;
}
Animation.prototype.draw_robot = function( model_transform, yellow, red, stack){


		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		model_transform = mult(model_transform, scale(.4, .3, .4));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(.35, 0, 0));
		model_transform = mult(model_transform, scale(.4, .3, .4));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		//model_transform = stack.pop();


	model_transform = mult(model_transform, translation(.35, .04 + .15, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.55, .08, .55));
		
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.35, 0, 0));
		model_transform = mult(model_transform, scale(.55, .08, .55));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		model_transform = mult(model_transform, translation(0, .04 +.075, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(1.3, .15, .91));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		model_transform = mult(model_transform, translation(0, .04 + .6, 0));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(1.5, 1.2, 1));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		//neck

		model_transform = mult(model_transform, translation(0, .6 + .07, 0 ));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.5, .14, .5));
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();

		//head
		model_transform = mult(model_transform, translation(0, .07 + .5, 0));
		stack.push(model_transform);
		this.m_cube.draw(this.graphicsState, model_transform, yellow);
		model_transform = stack.pop();
		stack.push(model_transform);

		//eyes
		stack.push(model_transform);
		model_transform = mult(model_transform, translation(-.2, 0, .5));
		stack.push(model_transform);
		model_transform = mult(model_transform, scale(.1, .1, .1));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		model_transform = mult(model_transform, translation(.4, 0, 0));
		model_transform = mult(model_transform, scale(.1, .1, .1));
		this.m_cube.draw(this.graphicsState, model_transform, red);
		model_transform = stack.pop();
		return model_transform;
}




Animation.prototype.update_strings = function( debug_screen_strings )		// Strings this particular class contributes to the UI
{
	debug_screen_strings.string_map["time"] = "Animation Time: " + this.graphicsState.animation_time/1000 + "s";
	debug_screen_strings.string_map["basis"] = "Showing basis: " + this.m_axis.basis_selection;
	debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	debug_screen_strings.string_map["thrust"] = "Thrust: " + thrust;
}