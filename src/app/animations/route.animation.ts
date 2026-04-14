import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

export const routeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          width: '100%',
          opacity: 0,
        }),
      ],
      { optional: true },
    ),

    query(
      ':leave',
      [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate(
          '200ms ease-in',
          style({
            opacity: 0,
            transform: 'translateX(-20px)',
          }),
        ),
      ],
      { optional: true },
    ),

    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate(
          '250ms ease-out',
          style({
            opacity: 1,
            transform: 'translateX(0)',
          }),
        ),
      ],
      { optional: true },
    ),
  ]),
]);
