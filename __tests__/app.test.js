const seed = require('../db/seeds/seed');
const {
    categoryData,
    reviewData,
    userData,
    commentData,
} = require('../db/data/test-data/index');
const db = require('../db/connection');
const app = require('../server/app');
const request = require('supertest');

beforeEach(() =>
    seed({ categoryData, reviewData, userData, commentData })
);

afterAll(() => {
    db.end();
});

describe(`GET /api`, () => {
    describe(`/categories`, () => {
        test('status 200, returns all categories', () => {
            return request(app)
                .get('/api/categories')
                .expect(200)
                .then(({ body }) => {
                    const { categories } = body;
                    expect(categories).toBeInstanceOf(Array);
                    expect(categories.length).toBe(4);
                    categories.forEach(category => {
                        expect(category).toEqual(
                            expect.objectContaining({
                                slug: expect.any(String),
                                description: expect.any(String),
                            })
                        );
                    });
                });
        });
        test('a misspelt endpoint is caught with a status 404', () => {
            return request(app)
                .get('/api/categorys')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe('Route not found');
                });
        })
        test('a missing endpoint is caught with a status 404', () => {
            return request(app)
                .get('/api/')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe('Route not found');
                });
        })
    });
    describe(`/reviews`, () => {
        describe(`/:review_id`, () => {
            test('status 200, returns a review object', () => {
                return request(app)
                .get('/api/reviews/1')
                .expect(200)
                .then(({ body }) => {
                    const { review } = body;
                    expect(review).toEqual({
                        review_id: 1,
                        title: 'Agricola',
                        designer: 'Uwe Rosenberg',
                        owner: 'mallionaire',
                        review_img_url:
                        'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                        review_body: 'Farmyard fun!',
                        category: 'euro game',
                        created_at: "2021-01-18T10:00:20.514Z",
                        votes:1,
                    })
                });
            })
            test('ERROR non-existent valid id returns 404 not found', () => {
                return request(app)
                    .get('/api/reviews/999999')
                    .expect(404)
                    .then(({ body }) => {
                        expect(body.msg).toBe("review_id not found")
                    })
            })
            test('ERROR invalid id returns 400 bad request', () => {
                return request(app)
                    .get('/api/reviews/epidemic')
                    .expect(400)
                    .then(({ body }) => {
                        expect(body.msg).toBe("bad request - review_id is not a number")
                    })
            })
        })
    })
});
