\set ON_ERROR_STOP on

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO venues (
    code,
    name,
    city,
    address,
    capacity,
    active
)
VALUES
    (
        'VEN-E2E-ACTIVE',
        'PulsePass E2E Arena',
        'Santa Marta',
        'Carrera 1 # 10-20',
        100,
        TRUE
    ),
    (
        'VEN-E2E-INACTIVE',
        'PulsePass E2E Closed Venue',
        'Barranquilla',
        'Calle 50 # 20-30',
        50,
        FALSE
    )
ON CONFLICT (code)
DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    capacity = EXCLUDED.capacity,
    active = EXCLUDED.active;

INSERT INTO events (
    event_code,
    name,
    description,
    category,
    status,
    event_date,
    minimum_age,
    venue_id,
    streaming_url
)
VALUES
    (
        'EVT-E2E-PUBLISHED',
        'PulsePass E2E Published Event',
        'Published event used by the manual E2E tests.',
        'MUSIC',
        'PUBLISHED',
        '2035-06-15 20:00:00',
        18,
        (
            SELECT id
            FROM venues
            WHERE code = 'VEN-E2E-ACTIVE'
        ),
        NULL
    ),
    (
        'EVT-E2E-DRAFT',
        'PulsePass E2E Draft Event',
        'Draft event used to verify protected access.',
        'TECHNOLOGY',
        'DRAFT',
        '2035-07-20 09:00:00',
        0,
        (
            SELECT id
            FROM venues
            WHERE code = 'VEN-E2E-ACTIVE'
        ),
        NULL
    ),
    (
        'EVT-E2E-TO-PUBLISH',
        'PulsePass E2E Event To Publish',
        'Draft event reserved for the publication flow.',
        'CULTURE',
        'DRAFT',
        '2035-08-25 18:00:00',
        0,
        (
            SELECT id
            FROM venues
            WHERE code = 'VEN-E2E-ACTIVE'
        ),
        NULL
    )
ON CONFLICT (event_code)
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    event_date = EXCLUDED.event_date,
    minimum_age = EXCLUDED.minimum_age,
    venue_id = EXCLUDED.venue_id,
    streaming_url = EXCLUDED.streaming_url;

INSERT INTO event_artists (
    event_id,
    artist_id
)
SELECT
    e.id,
    a.id
FROM events e
CROSS JOIN artists a
WHERE e.event_code IN (
    'EVT-E2E-PUBLISHED',
    'EVT-E2E-DRAFT'
)
AND a.stage_name = 'Solar Beat'
ON CONFLICT (event_id, artist_id)
DO NOTHING;

INSERT INTO users (
    username,
    email,
    active
)
VALUES
    (
        'admin_e2e',
        'admin@pulsepass.example.test',
        TRUE
    ),
    (
        'staff_e2e',
        'staff@pulsepass.example.test',
        TRUE
    ),
    (
        'inactive_e2e',
        'inactive@pulsepass.example.test',
        FALSE
    )
ON CONFLICT (username)
DO UPDATE SET
    email = EXCLUDED.email,
    active = EXCLUDED.active;

INSERT INTO user_profiles (
    first_name,
    last_name,
    phone,
    city,
    birth_date,
    user_id
)
VALUES
    (
        'Admin',
        'E2E',
        '3000000001',
        'Santa Marta',
        '1990-01-01',
        (
            SELECT id
            FROM users
            WHERE username = 'admin_e2e'
        )
    ),
    (
        'Staff',
        'E2E',
        '3000000002',
        'Santa Marta',
        '1992-02-02',
        (
            SELECT id
            FROM users
            WHERE username = 'staff_e2e'
        )
    ),
    (
        'Inactive',
        'E2E',
        '3000000003',
        'Santa Marta',
        '1994-03-03',
        (
            SELECT id
            FROM users
            WHERE username = 'inactive_e2e'
        )
    )
ON CONFLICT (user_id)
DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    birth_date = EXCLUDED.birth_date;

INSERT INTO user_credentials (
    user_id,
    password_hash,
    password_changed_at
)
VALUES
    (
        (
            SELECT id
            FROM users
            WHERE username = 'admin_e2e'
        ),
        crypt(:'admin_password', gen_salt('bf', 10)),
        CURRENT_TIMESTAMP
    ),
    (
        (
            SELECT id
            FROM users
            WHERE username = 'staff_e2e'
        ),
        crypt(:'staff_password', gen_salt('bf', 10)),
        CURRENT_TIMESTAMP
    ),
    (
        (
            SELECT id
            FROM users
            WHERE username = 'inactive_e2e'
        ),
        crypt(:'inactive_password', gen_salt('bf', 10)),
        CURRENT_TIMESTAMP
    )
ON CONFLICT (user_id)
DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    password_changed_at = EXCLUDED.password_changed_at;

DELETE FROM user_roles
WHERE user_id IN (
    SELECT id
    FROM users
    WHERE username IN (
        'admin_e2e',
        'staff_e2e',
        'inactive_e2e'
    )
);

INSERT INTO user_roles (
    user_id,
    role
)
VALUES
    (
        (
            SELECT id
            FROM users
            WHERE username = 'admin_e2e'
        ),
        'ADMIN'
    ),
    (
        (
            SELECT id
            FROM users
            WHERE username = 'staff_e2e'
        ),
        'STAFF'
    ),
    (
        (
            SELECT id
            FROM users
            WHERE username = 'inactive_e2e'
        ),
        'USER'
    );


-- FIXTURES_ADICIONALES_REGLAS_NEGOCIO_E2E

INSERT INTO venues (
    code,
    name,
    city,
    address,
    capacity,
    active
)
VALUES (
    'VEN-E2E-CAPACITY-ONE',
    'PulsePass E2E Capacity One',
    'Santa Marta',
    'Calle E2E 1',
    1,
    TRUE
)
ON CONFLICT (code)
DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    capacity = EXCLUDED.capacity,
    active = EXCLUDED.active;

INSERT INTO events (
    event_code,
    name,
    description,
    category,
    status,
    event_date,
    minimum_age,
    venue_id,
    streaming_url
)
VALUES
    (
        'EVT-E2E-MINIMUM-AGE',
        'PulsePass E2E Minimum Age',
        'Published event with intentionally unreachable age.',
        'CULTURE',
        'PUBLISHED',
        '2035-10-15 18:00:00',
        99,
        (
            SELECT id
            FROM venues
            WHERE code = 'VEN-E2E-ACTIVE'
        ),
        NULL
    ),
    (
        'EVT-E2E-SOLD-OUT',
        'PulsePass E2E Sold Out',
        'Published event with its only place occupied.',
        'MUSIC',
        'PUBLISHED',
        '2035-11-15 18:00:00',
        0,
        (
            SELECT id
            FROM venues
            WHERE code = 'VEN-E2E-CAPACITY-ONE'
        ),
        NULL
    )
ON CONFLICT (event_code)
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    event_date = EXCLUDED.event_date,
    minimum_age = EXCLUDED.minimum_age,
    venue_id = EXCLUDED.venue_id,
    streaming_url = EXCLUDED.streaming_url;

INSERT INTO tickets (
    ticket_code,
    type,
    price,
    status,
    purchase_date,
    user_id,
    event_id
)
VALUES (
    'TCK-E2E-SOLD-OUT-SEED',
    'GENERAL',
    100000.00,
    'PAID',
    CURRENT_TIMESTAMP,
    (
        SELECT id
        FROM users
        WHERE username = 'admin_e2e'
    ),
    (
        SELECT id
        FROM events
        WHERE event_code = 'EVT-E2E-SOLD-OUT'
    )
)
ON CONFLICT (ticket_code)
DO UPDATE SET
    type = EXCLUDED.type,
    price = EXCLUDED.price,
    status = EXCLUDED.status,
    purchase_date = EXCLUDED.purchase_date,
    user_id = EXCLUDED.user_id,
    event_id = EXCLUDED.event_id;

COMMIT;