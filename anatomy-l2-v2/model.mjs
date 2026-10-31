// All angles and reduction ratios below are illustrative, not Sony specifications.
export const PERIOD=24;
export const steps=[
 ['Reposo','El gatillo conserva su recorrido pasivo. La palanca está retirada del punto de contacto.'],
 ['Motor y sinfín','El motor gira el sinfín. La transmisión transforma muchas vueltas del motor en un pequeño giro de salida.'],
 ['Palanca posicionada','La rueda de salida acerca el brazo a la trayectoria del talón del gatillo.'],
 ['Contacto y resistencia','Al pulsar L2, el talón alcanza el brazo. La reacción mecánica se opone al giro del gatillo.'],
 ['Liberación','El dedo deja de pulsar; el retorno pasivo devuelve el gatillo. El motor retira después el brazo.']
];
export const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
export function model(t){
 const q=((t%PERIOD)+PERIOD)%PERIOD;
 const engage=q<4?0:q<9?ease((q-4)/5):q<20?1:1-ease((q-20)/4);
 const pull=q<11?0:q<15?ease((q-11)/4):q<17?1:q<20?1-ease((q-17)/3):0;
 const trigger=14*pull, arm=65-17.68072878514926*engage;
 const wheel=arm-65, motor=-wheel*20;
 return {t:q,engage,pull,trigger,arm,wheel,motor,contact:engage>.999&&pull>.998,step:q<4?0:q<9?1:q<11?2:q<17?3:4};
}
export function toe(s){const a=-s.trigger*Math.PI/180;return [78-18*Math.cos(a)+12*Math.sin(a),0,92-18*Math.sin(a)-12*Math.cos(a)]}
